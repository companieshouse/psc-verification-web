import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { URLSearchParams } from "url";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_CREATED, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { VALID_COMPANY_PSC_ITEMS } from "../../../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getCompanyIndividualPscList } from "../../../../src/services/companyPscService";

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;
mockGetPscVerification.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_VERIFICATION_CREATED
});

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

jest.mock("../../../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValueOnce(VALID_COMPANY_PSC_ITEMS.filter(psc => /^individual/.test(psc.kind)));

describe("individual PSC list view", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the Individual PSC List page with a success status code and correct links", async () => {
        const queryParams = new URLSearchParams("lang=en&pscType=individual");
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);
        mockGetPscVerification.mockResolvedValue(INDIVIDUAL_VERIFICATION_CREATED);

        const resp = await request(app).get(uri);

        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect($("a.govuk-back-link").attr("href")).toBe(`/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/psc-type?lang=en&pscType=individual&companyNumber=${COMPANY_NUMBER}`);
        // check page contents
        expect($("div#pscSelect-hint").text()).toContain(` ${validCompanyProfile.companyName} `);
        // radios for individual PSCs only
        expect($("input.govuk-radios__input").length).toBe(2);
        // check PSC IDs, names and hint text on radios
        expect($("input#pscSelect").attr("value")).toBe(getPscId(VALID_COMPANY_PSC_ITEMS[1]));
        expect($("label[for='pscSelect']").text().trim()).toBe(VALID_COMPANY_PSC_ITEMS[1].name);
        expect($("div#pscSelect-item-hint").text().trim()).toBe("Born in January 1970");
        expect($("input#pscSelect-2").attr("value")).toBe(getPscId(VALID_COMPANY_PSC_ITEMS[2]));
        expect($("label[for='pscSelect-2']").text().trim()).toBe(VALID_COMPANY_PSC_ITEMS[2].name);
        expect($("div#pscSelect-2-item-hint").text().trim()).toBe("Born in December 1997");
    });

    function getPscId (pscItem: any): string {
        return pscItem.links.self.split("/").pop();
    }

});

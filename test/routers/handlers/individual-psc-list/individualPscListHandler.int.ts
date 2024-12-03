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

const individualPscItems = VALID_COMPANY_PSC_ITEMS.filter(psc => /^individual/.test(psc.kind) && (psc.ceasedOn === null || psc.ceasedOn === undefined));

jest.mock("../../../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValueOnce(individualPscItems);

describe("individual PSC list view", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the Individual PSC List page with a success status code and correct links", async () => {
        const queryParams = new URLSearchParams(`lang=en&pscType=individual&companyNumber=${COMPANY_NUMBER}`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);
        mockGetPscVerification.mockResolvedValue(INDIVIDUAL_VERIFICATION_CREATED);

        const resp = await request(app).get(uri);

        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        // check page contents
        expect($("a.govuk-back-link").attr("href")).toBe(`/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en`);
        // summary cards for individual active PSCs only
        expect($("div.govuk-summary-card").length).toBe(2); // TODO: refine this to stubbed number
        // TODO: check PSC IDs, names, etc. for summary cards
    });

    function getPscId (pscItem: any): string {
        return pscItem.links.self.split("/").pop();
    }

});

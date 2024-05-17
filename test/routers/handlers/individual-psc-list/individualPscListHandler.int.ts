import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { URLSearchParams } from "url";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { CREATED_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { VALID_COMPANY_PSC_LIST } from "../../../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: CREATED_RESOURCE
    })
}));

jest.mock("../../../../src/services/companyPscService", () => ({
    getCompanyIndividualPscList: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: VALID_COMPANY_PSC_LIST
    })
}));

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const mockGetPscVerification = getPscVerification as jest.Mock;

describe("individual PSC list view", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
    });

    it("Should render the Individual PSC List page with a success status code and correct links", async () => {
        const queryParams = new URLSearchParams("lang=en&pscType=individual&companyNumber=12345678");
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const resp = await request(app).get(uri);

        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/psc-type?lang=en&pscType=individual&companyNumber=12345678");
    });

});

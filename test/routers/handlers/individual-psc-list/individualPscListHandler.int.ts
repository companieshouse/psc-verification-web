import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { URLSearchParams } from "url";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { COMPANY_NUMBER, CREATED_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { VALID_COMPANY_PSC_LIST } from "../../../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getCompanyIndividualPscList } from "../../../../src/services/companyPscService";
import { IncomingMessage } from "http";

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;

mockGetPscVerification.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: CREATED_RESOURCE
});

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValueOnce(validCompanyProfile);

jest.mock("../../../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;

mockGetCompanyIndividualPscList.mockResolvedValueOnce({
    // FIXME: should be CompanyPersonWithSignificantControlResource[] with correct property names!
    httpStatusCode: HttpStatusCode.Ok,
    resource: VALID_COMPANY_PSC_LIST
});

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
        mockGetPscVerification.mockResolvedValue(CREATED_RESOURCE);

        const resp = await request(app).get(uri);

        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/psc-type?lang=en&pscType=individual");
        // TODO: replace expectations below with checks on page HTML contents
        expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
        expect(mockGetPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledWith(expect.any(IncomingMessage), COMPANY_NUMBER);
        expect(mockGetCompanyIndividualPscList).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyIndividualPscList).toHaveBeenCalledWith(expect.any(IncomingMessage), COMPANY_NUMBER);

    });

});

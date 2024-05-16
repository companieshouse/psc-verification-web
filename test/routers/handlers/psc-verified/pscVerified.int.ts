import { HttpStatusCode } from "axios";
import request from "supertest";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { closeTransaction } from "../../../../src/services/transactionService";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: INDIVIDUAL_RESOURCE
    })
}));

jest.mock("../../../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    })
}));

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

jest.mock("../../../../src/services/transactionService", () => ({
    closeTransaction: jest.fn()
}));
const mockCloseTransaction = closeTransaction as jest.Mock;
mockCloseTransaction.mockResolvedValue({});

describe("psc verified view tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the PSC Verified Confirmation page with a success status code", async () => {
        const queryParams = new URLSearchParams("lang=en");
        const uriWithQuery = `${PrefixedUrls.PSC_VERIFIED}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);
        const response = await request(app).get(uri);
        expect(response.status).toBe(200);
    });
});

import { HttpStatusCode } from "axios";
import request from "supertest";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { closeTransaction } from "../../../../src/services/transactionService";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { COMPANY_NUMBER, INDIVIDUAL_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { getPscIndividual } from "../../../../src/services/pscService";
import { IncomingMessage } from "http";

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;
mockGetPscVerification.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_RESOURCE
});

jest.mock("../../../../src/services/pscService");
const mockGetPscIndividual = getPscIndividual as jest.Mock;
mockGetPscIndividual.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: PSC_INDIVIDUAL
});

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
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it.skip("Should render the PSC Verified Confirmation page with a success status code", async () => {
        const queryParams = new URLSearchParams("lang=en");
        const uriWithQuery = `${PrefixedUrls.PSC_VERIFIED}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const response = await request(app).get(uri);

        expect(response.status).toBe(200);
        expect(mockCloseTransaction).toHaveBeenCalledTimes(1);
        expect(mockCloseTransaction).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID);

        // TODO: replace expectations below with checks on page HTML contents
        expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
        expect(mockGetPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(2);
        expect(mockGetCompanyProfile).toHaveBeenCalledWith(expect.any(IncomingMessage), COMPANY_NUMBER);
        expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
        expect(mockGetPscIndividual).toHaveBeenCalledWith(expect.any(IncomingMessage), COMPANY_NUMBER, PSC_VERIFICATION_ID);

    });
});

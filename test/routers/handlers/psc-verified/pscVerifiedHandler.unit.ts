import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { PscVerifiedHandler } from "../../../../src/routers/handlers/psc-verified/pscVerifiedHandler";
import { getPscIndividual } from "../../../../src/services/pscService";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { closeTransaction } from "../../../../src/services/transactionService";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_FULL, PSC_NOTIFICATION_ID, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";

jest.mock("../../../../src/services/pscService");
const mockGetPscIndividual = getPscIndividual as jest.Mock;
mockGetPscIndividual.mockResolvedValue({
    httpStatusCode: HttpStatusCode.Ok,
    resource: PSC_INDIVIDUAL
});

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

jest.mock("../../../../src/services/transactionService", () => ({
    closeTransaction: jest.fn()
}));

const mockCloseTransaction = closeTransaction as jest.Mock;

describe("PSC Verified handler", () => {
    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("executeGet", () => {

        it("Should close the transaction and resolve correct view data", async () => {
            mockCloseTransaction.mockResolvedValueOnce(undefined);
            const request = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_VERIFIED,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    pscType: "individual"
                }
            });
            const response = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_FULL, companyProfile: validCompanyProfile } });
            const handler = new PscVerifiedHandler();
            const expectedPrefix = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}`;

            const resp = await handler.executeGet(request, response);
            const viewData = resp.viewData;
            expect(resp.templatePath).toBe("router_views/pscVerified/psc-verified");
            expect(viewData).toMatchObject({
                currentUrl: `${expectedPrefix}/psc-verified?lang=en`,
                companyNumber: COMPANY_NUMBER,
                companyName: "Test Company",
                pscName: "Sir Forename Middlename Surname",
                referenceNumber: TRANSACTION_ID,
                errors: {}
            });
            expect(mockGetPscVerification).not.toHaveBeenCalled();
            expect(mockGetCompanyProfile).not.toHaveBeenCalled();
            expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
            expect(mockGetPscIndividual).toHaveBeenCalledWith(request, COMPANY_NUMBER, PSC_NOTIFICATION_ID);
            expect(mockCloseTransaction).toHaveBeenCalledTimes(1);
            expect(mockCloseTransaction).toHaveBeenCalledWith(request, TRANSACTION_ID, PSC_VERIFICATION_ID);

        });
    });
});

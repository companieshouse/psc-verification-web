import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { PscVerifiedHandler } from "../../../../src/routers/handlers/psc-verified/pscVerifiedHandler";
import { closeTransaction } from "../../../../src/services/transactionService";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";

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
            const response = httpMocks.createResponse();
            const handler = new PscVerifiedHandler();
            const expectedPrefix = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}`;

            const resp = await handler.executeGet(request, response);
            const viewData = resp.viewData;
            expect(resp.templatePath).toBe("router_views/pscVerified/pscVerified");
            expect(resp.viewData).toMatchObject({
                currentUrl: `${expectedPrefix}/psc-verified?lang=en`,
                companyNumber: "99999999",
                companyName: "Test Data LTD",
                pscName: "Mr Test Testerton",
                referenceNumber: TRANSACTION_ID,
                errors: {}
            });
            expect(mockCloseTransaction).toHaveBeenCalledWith(request, TRANSACTION_ID, PSC_VERIFICATION_ID);
        });
    });
});

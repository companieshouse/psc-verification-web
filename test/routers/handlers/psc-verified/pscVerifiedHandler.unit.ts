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
            const req = httpMocks.createRequest({
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
            const res = httpMocks.createResponse();
            const handler = new PscVerifiedHandler();
            const expectedPrefix = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}`;

            const resp = await handler.executeGet(req, res);

            expect(resp.templatePath).toBe("router_views/pscVerified/pscVerified");
            expect(resp.viewData).toMatchObject({
                currentUrl: `${expectedPrefix}/psc-verified?lang=en`,
                errors: {}
            });
            expect(mockCloseTransaction).toHaveBeenCalledWith(req, TRANSACTION_ID, PSC_VERIFICATION_ID);
        });
    });
});

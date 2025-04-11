import { blockClosedTransaction } from "../../src/middleware/blockClosedTransaction";
import { getTransaction } from "../../src/services/transactionService";
import { HttpError } from "../../src/lib/errors/httpError";
import httpMocks from "node-mocks-http";
import { PrefixedUrls } from "../../src/constants";
import { CLOSED_PSC_TRANSACTION, OPEN_PSC_TRANSACTION, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/transaction.mock";

jest.mock("../../src/services/transactionService");
const mockGetTransaction = getTransaction as jest.Mock;

function generateRequest (url: string): any {
    return httpMocks.createRequest({
        method: "GET",
        url,
        params: {
            transactionId: TRANSACTION_ID,
            submissionId: PSC_VERIFICATION_ID
        },
        query: {
            pscType: "individual"
        }
    });
}

describe("blockClosedTransaction middleware", () => {
    const mockNext = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call next if the transaction is open", async () => {
        const req = generateRequest(PrefixedUrls.PERSONAL_CODE);
        const res = httpMocks.createResponse();

        mockGetTransaction.mockResolvedValueOnce(OPEN_PSC_TRANSACTION);

        await blockClosedTransaction(req, res, mockNext);

        expect(mockGetTransaction).toHaveBeenCalledWith(req, TRANSACTION_ID);
        expect(mockNext).toHaveBeenCalled();
        expect(mockNext).not.toHaveBeenCalledWith(expect.any(HttpError));
    });

    it("should return an error if the transaction is closed", async () => {
        const req = generateRequest(PrefixedUrls.PERSONAL_CODE);
        const res = httpMocks.createResponse();

        mockGetTransaction.mockResolvedValueOnce(CLOSED_PSC_TRANSACTION);

        await blockClosedTransaction(req, res, mockNext);

        expect(mockGetTransaction).toHaveBeenCalledWith(req, TRANSACTION_ID);
        expect(mockNext).toHaveBeenCalledWith(expect.any(HttpError));
        const error = mockNext.mock.lastCall![0];
        expect(error).toBeInstanceOf(HttpError);
        expect(error.message).toBe("Transaction is closed");
        expect(error.status).toBe(410); // HTTP GONE
    });

    it("should skip the middleware for the psc-verified screen", async () => {
        const req = generateRequest(PrefixedUrls.PSC_VERIFIED);
        const res = httpMocks.createResponse();

        await blockClosedTransaction(req, res, mockNext);

        expect(mockGetTransaction).not.toHaveBeenCalled();
        expect(mockNext).toHaveBeenCalled();
    });
});

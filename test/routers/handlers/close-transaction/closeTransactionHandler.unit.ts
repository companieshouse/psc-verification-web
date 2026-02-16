import { Request, Response } from "express";
import { closeTransaction as closeTransactionService } from "../../../../src/services/transactionService";
import { CloseTransactionHandler } from "../../../../src/routers/handlers/close-transaction/closeTransactionHandler";
import { PscVerifiedHandler } from "../../../../src/routers/handlers/psc-verified/pscVerifiedHandler";

jest.mock("../../../../src/services/transactionService");
jest.mock("../../../../src/routers/handlers/psc-verified/pscVerifiedHandler");

describe("CloseTransactionHandler", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let handler: CloseTransactionHandler;
    const TRANSACTION_ID = "tx123";
    const SUBMISSION_ID = "sub456";

    beforeEach(() => {
        req = {
            params: {
                transactionId: "tx123",
                submissionId: "sub456"
            },
            query: {
                companyNumber: "12345678",
                lang: "en"
            }
        };
        res = {};
        handler = new CloseTransactionHandler();
        (closeTransactionService as jest.Mock).mockClear();
        (PscVerifiedHandler as unknown as jest.Mock).mockClear();
    });

    it("should close the transaction and return redirect URL", async () => {
        (closeTransactionService as jest.Mock).mockResolvedValueOnce({});
        const redirectUrl = await handler.execute(req as Request, res as Response);
        expect(closeTransactionService).toHaveBeenCalledWith(req, TRANSACTION_ID, SUBMISSION_ID);
        expect(redirectUrl).toContain("/persons-with-significant-control-verification/transaction/tx123/submission/sub456/psc-verified");
        expect(redirectUrl).toContain("companyNumber=12345678");
        expect(redirectUrl).toContain("lang=en");
    });

    it("should throw error if closeTransactionService fails", async () => {
        (closeTransactionService as jest.Mock).mockRejectedValueOnce(new Error("fail"));
        await expect(handler.execute(req as Request, res as Response)).rejects.toThrow("failed to close transaction");
    });

    it("should build correct redirect URL with language", async () => {
        (closeTransactionService as jest.Mock).mockResolvedValueOnce({});
        req.query = req.query ?? {};
        req.query.lang = "cy";
        const redirectUrl = await handler.execute(req as Request, res as Response);
        expect(redirectUrl).toContain("lang=cy");
        expect(redirectUrl).toContain("companyNumber=12345678");
    });

    it("should call closeTransaction with correct params", async () => {
        (closeTransactionService as jest.Mock).mockResolvedValueOnce({});
        await handler.execute(req as Request, res as Response);
        expect(closeTransactionService).toHaveBeenCalledWith(req, TRANSACTION_ID, SUBMISSION_ID);
    });

    it("should call closeTransaction with correct params when transactionId and submissionId are arrays", async () => {
        req = {
            params: {
                transactionId: ["tx123"],
                submissionId: ["sub456"]
            },
            query: {
                companyNumber: "12345678",
                lang: "en"
            }
        };
        (closeTransactionService as jest.Mock).mockResolvedValueOnce({});
        await handler.execute(req as Request, res as Response);
        expect(closeTransactionService).toHaveBeenCalledWith(req, TRANSACTION_ID, SUBMISSION_ID);
    });

    it("should throw error in closeTransaction if service throws", async () => {
        (closeTransactionService as jest.Mock).mockRejectedValueOnce(new Error("fail"));
        await expect(handler.closeTransaction(req as Request, TRANSACTION_ID, SUBMISSION_ID)).rejects.toThrow("failed to close transaction");
    });

    it("should throw error if transactionId or submissionId are missing", async () => {
        req = {
            params: {
                transactionId: "",
                submissionId: ""
            }
        };

        (closeTransactionService as jest.Mock).mockResolvedValueOnce({});

        await expect(handler.execute(req as Request, res as Response)).rejects.toThrow("failed to close transaction for transactionId=\"\", submissionId=\"\"");
    });

});

import request from "supertest";
import express, { Request, Response } from "express";
import closeTransactionRouter from "../../src/routers/closeTransactionRouter";
import { CloseTransactionHandler } from "../../src/routers/handlers/close-transaction/closeTransactionHandler";

jest.mock("../../src/routers/handlers/close-transaction/closeTransactionHandler");

describe("closeTransactionRouter", () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use(express.urlencoded({ extended: false }));
        app.use("/transaction/:transactionId/submission/:submissionId/close-transaction", closeTransactionRouter);
        (CloseTransactionHandler as unknown as jest.Mock).mockClear();
    });

    it("should redirect to the url returned by handler.execute", async () => {
        const mockExecute = jest.fn().mockResolvedValue("/redirect-url?lang=en");
        (CloseTransactionHandler as unknown as jest.Mock).mockImplementation(() => ({
            execute: mockExecute
        }));

        const response = await request(app)
            .get("/transaction/tx123/submission/sub456/close-transaction")
            .send();

        expect(mockExecute).toHaveBeenCalled();
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe("/redirect-url?lang=en");
    });

    it("should handle errors thrown by handler.execute", async () => {
        const mockExecute = jest.fn().mockRejectedValue(new Error("fail"));
        (CloseTransactionHandler as unknown as jest.Mock).mockImplementation(() => ({
            execute: mockExecute
        }));

        // Add error handler to catch thrown errors
        app.use((err: any, req: Request, res: Response, next: Function) => {
            res.status(500).send("Error: " + err.message);
        });

        const response = await request(app)
            .get("/transaction/tx123/submission/sub456/close-transaction")
            .send();

        expect(mockExecute).toHaveBeenCalled();
        expect(response.status).toBe(500);
        expect(response.text).toContain("Error: fail");
    });

    it("should pass query params to handler", async () => {
        const mockExecute = jest.fn().mockResolvedValue("/redirect-url?lang=cy");
        (CloseTransactionHandler as unknown as jest.Mock).mockImplementation(() => ({
            execute: mockExecute
        }));

        await request(app)
            .get("/transaction/tx123/submission/sub456/close-transaction?lang=cy")
            .send();

        expect(mockExecute).toHaveBeenCalledWith(
            expect.objectContaining({ params: expect.objectContaining({ transactionId: "tx123", submissionId: "sub456" }), query: expect.objectContaining({ lang: "cy" }) }),
            expect.any(Object)
        );
    });
});

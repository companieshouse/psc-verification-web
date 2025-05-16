import { requestIdGenerator } from "../../src/middleware/requestIdGenerator";
import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

jest.mock("uuid", () => ({ v4: jest.fn() }));

describe("requestIdGenerator middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
        req = { headers: {} };
        res = { setHeader: jest.fn() };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should generate a UUID and set it in the request and response headers", () => {
        const mockRequestId = "mock-uuid";
        (uuidv4 as jest.Mock).mockReturnValue(mockRequestId);

        requestIdGenerator(req as Request, res as Response, next);

        expect(req.headers?.["x-request-id"]).toBe(mockRequestId);
        expect(req.headers?.context).toBe(mockRequestId);
        expect(next).toHaveBeenCalled();
    });

    it("should call next without errors", () => {
        requestIdGenerator(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
    });
});

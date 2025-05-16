import { requestLogger } from "../../src/middleware/requestLogger";
import { NextFunction, Request, Response } from "express";
import { logger } from "../../src/lib/logger";

jest.mock("../../src/lib/logger");
jest.mock("uuid", () => ({ v4: jest.fn() }));

describe("requestLogger middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
        req = { url: "/test-url", method: "GET", originalUrl: "/test-url", headers: { "x-request-id": "mock-id", context: "mock-id" } };
        res = {
            setHeader: jest.fn(),
            on: jest.fn((event: string, callback: () => void) => {
                if (event === "finish") {
                    callback();
                }
                return res as Response;
            })
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should skip logging for healthcheck route", () => {
        req.url = "/healthcheck";

        requestLogger(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(logger.debugRequest).not.toHaveBeenCalled();
    });

    it("should log the request and response details", () => {
        requestLogger(req as Request, res as Response, next);

        expect(logger.debugRequest).toHaveBeenCalledWith(req, expect.stringContaining("OPEN request mock-id"));
        expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("CLOSED request mock-id"));
        expect(next).toHaveBeenCalled();
    });

    it("should calculate and log the request duration", () => {
        const mockHrtime = jest.spyOn(process, "hrtime")
            .mockImplementationOnce(() => [0, 0]) // Start time
            .mockImplementationOnce(() => [6, 400000000]); // End time

        requestLogger(req as Request, res as Response, next);

        expect(logger.debug).toHaveBeenCalledWith(expect.stringContaining("CLOSED request mock-id after 6400.00ms"));
        mockHrtime.mockRestore();
    });
});

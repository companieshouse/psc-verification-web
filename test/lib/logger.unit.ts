import { HttpStatusCode } from "axios";
import { HttpError } from "../../src/lib/errors/httpError";
import { createAndLogError, createAndLogHttpError, logger } from "../../src/lib/logger";

// create a mock logger
jest.mock("@companieshouse/structured-logging-node", () => ({
    createLogger: jest.fn(() => ({
        error: jest.fn(),
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        trace: jest.fn()
    }))
}));

describe("logger", () => {
    describe("createAndLogError", () => {
        it("should create and log an error", () => {
            const error = createAndLogError("Test error");
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe("Test error");
            expect(logger.error).toHaveBeenCalledWith(`${error.stack}`);
        });
    });

    describe("createAndLogHttpError", () => {
        it("should create and log an error with HTTP status code", () => {
            const error = createAndLogHttpError("Test HTTP error", HttpStatusCode.InternalServerError);
            expect(error).toBeInstanceOf(HttpError);
            expect(error.message).toBe("Test HTTP error");
            expect(error.status).toBe(HttpStatusCode.InternalServerError);
            expect(logger.error).toHaveBeenCalledWith(`${error.status} - ${error.stack}`);
        });
    });
});

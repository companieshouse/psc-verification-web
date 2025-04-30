import { createAndLogError, logger } from "../../src/lib/logger";

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

});

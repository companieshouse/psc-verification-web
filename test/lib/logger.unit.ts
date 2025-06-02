import { PrefixedLogger } from "../../src/lib/logger";
import { Request } from "express";
import { jest } from "@jest/globals";

describe("PrefixedLogger", () => {
    let logger: PrefixedLogger;
    let mockRawLogger: any;

    beforeEach(() => {
        mockRawLogger = {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            trace: jest.fn(),
            infoRequest: jest.fn(),
            errorRequest: jest.fn(),
            debugRequest: jest.fn(),
            traceRequest: jest.fn()
        };
        jest.spyOn(require("@companieshouse/structured-logging-node"), "createLogger").mockReturnValue(mockRawLogger);
        logger = new PrefixedLogger();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should log info messages with prefix", () => {
        logger.info("Test info message");
        expect(mockRawLogger.info).toHaveBeenCalledWith(expect.stringContaining("Test info message"));
    });

    it("should log error messages with prefix", () => {
        logger.error("Test error message");
        expect(mockRawLogger.error).toHaveBeenCalledWith(expect.stringContaining("Test error message"));
    });

    it("should log debug messages with prefix", () => {
        logger.debug("Test debug message");
        expect(mockRawLogger.debug).toHaveBeenCalledWith(expect.stringContaining("Test debug message"));
    });

    it("should log trace messages with prefix", () => {
        logger.trace("Test trace message");
        expect(mockRawLogger.trace).toHaveBeenCalledWith(expect.stringContaining("Test trace message"));
    });

    it("should log infoRequest messages with prefix", () => {
        const mockRequest = {} as Request;
        logger.infoRequest(mockRequest, "Test infoRequest message");
        expect(mockRawLogger.infoRequest).toHaveBeenCalledWith(mockRequest, expect.stringContaining("Test infoRequest message"));
    });

    it("should log errorRequest messages with prefix", () => {
        const mockRequest = {} as Request;
        logger.errorRequest(mockRequest, "Test errorRequest message");
        expect(mockRawLogger.errorRequest).toHaveBeenCalledWith(mockRequest, expect.stringContaining("Test errorRequest message"));
    });

    it("should log debugRequest messages with prefix", () => {
        const mockRequest = {} as Request;
        logger.debugRequest(mockRequest, "Test debugRequest message");
        expect(mockRawLogger.debugRequest).toHaveBeenCalledWith(mockRequest, expect.stringContaining("Test debugRequest message"));
    });

    it("should log traceRequest messages with prefix", () => {
        const mockRequest = {} as Request;
        logger.traceRequest(mockRequest, "Test traceRequest message");
        expect(mockRawLogger.traceRequest).toHaveBeenCalledWith(mockRequest, expect.stringContaining("Test traceRequest message"));
    });

    it("should generate a ClassName::methodName prefix from stack trace", () => {
        const mockError = new Error();
        mockError.stack = [
            "Error: Test error",
            "    at PrefixedLogger.getPrefix (/path/to/logger.ts:10:20)",
            "    at Object.<anonymous> (/path/to/test.ts:15:25)"
        ].join("\n");
        const prefix = logger.getPrefix({ error: mockError });
        expect(prefix).toBe("PrefixedLogger::getPrefix -");
    });

    it("should generate a methodName prefix from stack trace", () => {
        const mockError = new Error();
        mockError.stack = [
            "Error: Test error",
            "    at getPrefix (/path/to/logger.ts:10:20)",
            "    at Object.<anonymous> (/path/to/test.ts:15:25)"
        ].join("\n");
        const prefix = logger.getPrefix({ error: mockError });
        expect(prefix).toBe("getPrefix -");
    });

    it("should generate prefix from stack trace with filepath format", () => {
        const mockError = new Error();
        mockError.stack = [
            "Error: Test error",
            "    at /path/to/filename.ts:10:20",
            "    at Object.<anonymous> (/path/to/test.ts:15:25)"
        ].join("\n");
        const prefix = logger.getPrefix({ error: mockError });
        expect(prefix).toBe("filename -");
    });

    it("should handle missing stack trace gracefully", () => {
        const error = new Error();
        error.stack = undefined;
        const prefix = logger.getPrefix({ error });
        expect(prefix).toBe("");
    });

    it("should log an error and return an empty string when stack trace is invalid", () => {
        const mockError = new Error();
        mockError.stack = "Invalid stack trace format";
        const prefix = logger.getPrefix({ error: mockError });
        expect(prefix).toBe("");
        expect(mockRawLogger.error).toHaveBeenCalledWith(expect.stringContaining("unable to extract log prefix from stack trace"));
    });

    it("should log an error and return an empty string when the stack trace can't be parsed", () => {
        const mockError = new Error();
        mockError.stack = [
            "Error: Test error",
            "    THIS CANNOT BE PARSED",
            "    at Object.<anonymous> (/path/to/test.ts:15:25)"
        ].join("\n");
        const prefix = logger.getPrefix({ error: mockError });
        expect(prefix).toBe("");
        expect(mockRawLogger.error).toHaveBeenCalledWith(expect.stringContaining("unable to extract log prefix from stack trace"));
    });
});

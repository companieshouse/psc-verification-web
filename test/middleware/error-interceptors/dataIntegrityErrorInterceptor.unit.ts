import { NextFunction, Request, Response } from "express";
import { DataIntegrityError, DataIntegrityErrorType } from "../../../src/lib/errors/dataIntegrityError";
import { dataIntegrityErrorInterceptor } from "../../../src/middleware/error-interceptors/dataIntegrityErrorInterceptor";
import { logger } from "../../../src/lib/logger";
import { HttpStatusCode } from "axios";

jest.mock("../../../src/lib/logger");

describe("dataIntegrityErrorInterceptor", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: jest.MockedFunction<NextFunction>;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            redirect: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    it("should pass non-DataIntegrityError errors to the next middleware", () => {
        const error = new Error("Some other error");

        dataIntegrityErrorInterceptor(error, req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(error);
    });

    it("should log the error and redirect for PSC_DATA type", () => {
        const error = new DataIntegrityError("PSC data issue", DataIntegrityErrorType.PSC_DATA);
        req.query = { companyNumber: "12345678", lang: "en" };
        dataIntegrityErrorInterceptor(error, req as Request, res as Response, next);
        expect(logger.error).toHaveBeenCalledWith(`${error.stack}`);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
        expect(res.redirect).toHaveBeenCalledWith("/persons-with-significant-control-verification/stop/problem-with-psc-data?companyNumber=12345678&lang=en");
    });

    it("should handle PSC_DATA type with undefined req.query", () => {
        const error = new DataIntegrityError("PSC data issue", DataIntegrityErrorType.PSC_DATA);
        req.query = undefined;
        dataIntegrityErrorInterceptor(error, req as Request, res as Response, next);
        expect(logger.error).toHaveBeenCalledWith(`${error.stack}`);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
        expect(res.redirect).toHaveBeenCalledWith("/persons-with-significant-control-verification/stop/problem-with-psc-data?companyNumber=&lang=");
    });

    it("should handle PSC_DATA type with null req.query (simulated as undefined)", () => {
        const error = new DataIntegrityError("PSC data issue", DataIntegrityErrorType.PSC_DATA);
        // TypeScript does not allow null, so simulate with undefined
        req.query = undefined;
        dataIntegrityErrorInterceptor(error, req as Request, res as Response, next);
        expect(logger.error).toHaveBeenCalledWith(`${error.stack}`);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
        expect(res.redirect).toHaveBeenCalledWith("/persons-with-significant-control-verification/stop/problem-with-psc-data?companyNumber=&lang=");
    });

    it("should handle PSC_DATA type with missing companyNumber and lang", () => {
        const error = new DataIntegrityError("PSC data issue", DataIntegrityErrorType.PSC_DATA);
        req.query = {};
        dataIntegrityErrorInterceptor(error, req as Request, res as Response, next);
        expect(logger.error).toHaveBeenCalledWith(`${error.stack}`);
        expect(res.status).toHaveBeenCalledWith(HttpStatusCode.InternalServerError);
        expect(res.redirect).toHaveBeenCalledWith("/persons-with-significant-control-verification/stop/problem-with-psc-data?companyNumber=&lang=");
    });

    it("should pass unhandled DataIntegrityError types to the next middleware as a generic error", () => {
        const error = new DataIntegrityError("Unhandled type", "UNHANDLED_TYPE" as DataIntegrityErrorType);

        dataIntegrityErrorInterceptor(error, req as Request, res as Response, next);

        expect(next).toHaveBeenCalledWith(new Error(`Unhandled DataIntegrityError type: ${error.type}`));
    });
});

import { NextFunction, Request, Response } from "express";
import { fetchVerification } from "../../src/middleware/fetchVerification";

jest.mock("../../src/middleware/fetchVerification");

// get handle on mocked function
const mockFetchVerificationMiddleware = fetchVerification as jest.Mock;

// tell the mock what to return
mockFetchVerificationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockFetchVerificationMiddleware;

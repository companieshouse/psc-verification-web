import { NextFunction, Request, Response } from "express";
import { pscVerificationApiAvailable } from "../../src/middleware/serviceAvailable";

jest.mock("../../src/middleware/serviceAvailable");

// get handle on mocked function
const mockServiceAvailableMiddleware = pscVerificationApiAvailable as jest.Mock;

// tell the mock what to return
mockServiceAvailableMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockServiceAvailableMiddleware;

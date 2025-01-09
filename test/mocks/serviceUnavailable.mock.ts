import { NextFunction, Request, Response } from "express";
import { serviceUnavailable } from "../../src/middleware/serviceUnavailable";

jest.mock("../../src/middleware/serviceUnavailable");

// get handle on mocked function
const mockServiceUnavailableMiddleware = serviceUnavailable as jest.Mock;

// tell the mock what to return
mockServiceUnavailableMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockServiceUnavailableMiddleware;

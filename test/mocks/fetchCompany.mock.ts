import { NextFunction, Request, Response } from "express";
import { fetchCompany } from "../../src/middleware/fetchCompany";

jest.mock("../../src/middleware/fetchCompany");

// get handle on mocked function
const mockFetchCompanyMiddleware = fetchCompany as jest.Mock;

// tell the mock what to return
mockFetchCompanyMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockFetchCompanyMiddleware;

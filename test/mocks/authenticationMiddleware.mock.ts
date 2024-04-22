import { Session } from "@companieshouse/node-session-handler";
import { NextFunction, Request, Response } from "express";
import { authenticate } from "../../src/middleware/authentication";

jest.mock("../../src/middleware/authentication");

// get handle on mocked function
const mockAuthenticationMiddleware = authenticate as jest.Mock;

export const session = new Session();

// tell the mock what to return
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

export default mockAuthenticationMiddleware;

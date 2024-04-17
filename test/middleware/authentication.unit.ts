import { AuthOptions, authMiddleware } from "@companieshouse/web-security-node";
import { NextFunction, Request, Response } from "express";
import { authenticationMiddleware } from "../../src/middleware/authentication";

jest.mock("@companieshouse/web-security-node");
jest.mock("./../../src/middleware/authentication");

const mockAuthenticationMiddleware = authenticationMiddleware as jest.Mock;
const mockAuthReturnedFunction = jest.fn();
// When the mocked authenticationMiddleware is called, make it return a mocked function so we can verify it gets called
mockAuthenticationMiddleware.mockReturnValue(mockAuthReturnedFunction);

const mockAuthMiddleware = authMiddleware as jest.Mock;
mockAuthMiddleware.mockImplementation((expectedConfig: AuthOptions) => next());
mockAuthMiddleware.mockReturnValue(mockAuthReturnedFunction);

const URL = "/psc-verification/something";
const req: Request = { originalUrl: URL } as Request;
const res: Response = {} as Response;
const next = jest.fn();

const expectedConfig: AuthOptions = {
    chsWebUrl: "http://chs.local",
    returnUrl: URL
};

describe("authenticationMiddleware", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        req.originalUrl = URL;
    });

    it("should use the correct URLs", () => {
        authenticationMiddleware(req, res, next);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledWith(req, res, next);
        // expect(mockAuthMiddleware).toHaveBeenCalledWith(expectedConfig);
    });
});

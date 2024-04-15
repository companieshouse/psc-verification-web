import { AuthOptions, authMiddleware } from "@companieshouse/web-security-node";
import { NextFunction, Request, Response } from "express";
import { authenticationMiddleware } from "../../src/middleware/authentication";

jest.mock("@companieshouse/web-security-node");

// get handle on mocked function
const mockAuthenticationMiddleware = authMiddleware as jest.Mock;

// tell the mock what to return
mockAuthenticationMiddleware.mockImplementation((req: Request, res: Response, next: NextFunction) => next());

describe("authenticationMiddleware", () => {

    it("should use the correct URLs", () => {
        const originalUrl = "originalUrl";
        const req = { originalUrl } as Request;
        const expectedConfig: AuthOptions = {
            chsWebUrl: "",
            returnUrl: originalUrl
        };
        const res = {} as Response;
        const next = jest.fn();
        authenticationMiddleware(req, res, next);

        // wip
        // expect(mockAuthenticationMiddleware).toHaveBeenCalled();
        // expect(authMiddleware).toHaveBeenCalledWith(expectedConfig);
    });
});

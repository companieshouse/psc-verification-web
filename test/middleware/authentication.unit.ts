import { NextFunction, Request, Response } from "express";
import { authenticate } from "../../src/middleware/authentication";
import { authMiddleware } from "@companieshouse/web-security-node";

const mockRequestHandler = jest.fn();

jest.mock("@companieshouse/web-security-node", () => ({
    authMiddleware: jest.fn(() => mockRequestHandler)
}));

describe("Authenticate via Authentication middleware", () => {
    const request = {} as Request;
    const response = {} as Response;
    const next = jest.fn() as NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should call authMiddleware with correct config", () => {
        request.originalUrl = "/some-url";

        authenticate(request, response, next);

        expect(authMiddleware).toHaveBeenCalledWith({
            chsWebUrl: process.env.CHS_URL,
            returnUrl: "/some-url"
        });
        expect(mockRequestHandler).toHaveBeenCalledWith(
            {
                originalUrl: "/some-url"
            },
            {},
            next
        );
    });

});

import { getUserEmail } from "../../src/middleware/getUserEmail";
import { NextFunction, Request, Response } from "express";
import { getSignedInSessionRequest, userMail } from "../mocks/session.mock";

describe("getUserEmail middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = {};
        res = { locals: {} };
        next = jest.fn();
    });

    it("should set userEmail if user is signed in", () => {
        req.session = getSignedInSessionRequest();
        getUserEmail(req as Request, res as Response, next);
        expect(res.locals!.userEmail).toBe(userMail);
        expect(next).toHaveBeenCalled();
    });

    it("should not set userEmail if user is not signed in", () => {
        getUserEmail(req as Request, res as Response, next);
        expect(res.locals!.userEmail).toBeUndefined();
        expect(next).toHaveBeenCalled();
    });
});

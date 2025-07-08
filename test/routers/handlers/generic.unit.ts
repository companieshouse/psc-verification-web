import { Request, Response } from "express";
import * as generic from "../../../src/routers/handlers/generic";

jest.mock("../../../src/lib/logger", () => ({
    logger: { error: jest.fn() }
}));

jest.mock("../../../src/lib/utils/error-manifests/errorManifest", () => jest.fn(() => "mockedErrorManifest"));

describe("populateViewData", () => {
    let req: any;
    let res: Partial<Response>;
    let viewData: any;

    beforeEach(() => {
        req = { session: { data: {} } };
        res = {};
        viewData = {};
        jest.clearAllMocks();
    });

    it("sets isSignedIn to false if not signed in", () => {
        req.session = { data: {} };
        generic.populateViewData(viewData, req as Request, res as Response);
        expect(viewData.isSignedIn).toBe(false);
    });

    it("sets isSignedIn to true and userEmail if signed in and email present", () => {
        req.session = { data: { signin_info: { signed_in: 1, user_profile: { email: "test@example.com" } } } };
        generic.populateViewData(viewData, req as Request, res as Response);
        expect(viewData.isSignedIn).toBe(true);
        expect(viewData.userEmail).toBe("test@example.com");
    });

    it("sets userEmail to blank and logs error if signed in but email missing", () => {
        req.session = { data: { signin_info: { signed_in: 1, user_profile: {} } } };
        generic.populateViewData(viewData, req as Request, res as Response);
        expect(viewData.isSignedIn).toBe(true);
        expect(viewData.userEmail).toBe("");
        const { logger } = require("../../../src/lib/logger");
        expect(logger.error).toHaveBeenCalledWith(
            "GenericHandler unable to get email. Email is undefined."
        );
    });
});

describe("getViewData", () => {
    it("returns defaultBaseViewData with isSignedIn false if not signed in", async () => {
        const req: any = { session: { data: {} } };
        const res = {} as Partial<Response>;
        const data = await generic.getViewData(req as Request, res as Response);
        expect(data.isSignedIn).toBe(false);
        expect(data.title).toBe("Apply to file with Companies House using software");
    });

    it("returns viewData with isSignedIn true and userEmail if signed in", async () => {
        const req: any = { session: { data: { signin_info: { signed_in: 1, user_profile: { email: "foo@bar.com" } } } } };
        const res = {} as Partial<Response>;
        const data = await generic.getViewData(req as Request, res as Response);
        expect(data.isSignedIn).toBe(true);
        expect(data.userEmail).toBe("foo@bar.com");
    });
});

describe("GenericHandler", () => {
    class TestHandler extends generic.GenericHandler<any> {
        public getErrorManifest () {
            return this.errorManifest;
        }
    }

    it("getViewData sets errorManifest and viewData", async () => {
        const handler = new TestHandler();
        const req: any = { session: { data: {} } };
        const res = {} as Partial<Response>;
        const data = await handler.getViewData(req as Request, res as Response);
        expect(handler.getErrorManifest()).toBe("mockedErrorManifest");
        expect(data).toBeDefined();
    });

    it("processHandlerException returns stack for VALIDATION_ERRORS", () => {
        const handler = new TestHandler();
        const err = { name: "VALIDATION_ERRORS", stack: "stacktrace" };
        expect(handler.processHandlerException(err)).toBe("stacktrace");
    });

    it("processHandlerException throws for other errors", () => {
        const handler = new TestHandler();
        const err = new Error("Some error");
        expect(() => handler.processHandlerException(err)).toThrow(err);
    });
});

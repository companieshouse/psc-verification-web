import { Request, Response } from "express";
import * as generic from "../../../src/routers/handlers/generic";

jest.mock("../../../src/lib/logger", () => ({
    logger: { error: jest.fn() }
}));

jest.mock("../../../src/lib/utils/error-manifests/errorManifest", () => jest.fn(() => "mockedErrorManifest"));

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

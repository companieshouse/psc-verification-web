import { getLocalesService, localise, selectLang } from "../../src/middleware/localise";
import { NextFunction, Request, Response } from "express";

jest.mock("@companieshouse/ch-node-utils", () => ({
    LanguageNames: {
        sourceLocales: jest.fn(() => ["en", "cy"])
    },
    LocalesService: {
        getInstance: jest.fn(() => ({
            enabled: true,
            localesFolder: "/mock/locales",
            i18nCh: {
                resolveNamespacesKeys: jest.fn(() => ({
                    test: "value"
                }))
            }
        }))
    }
}));

describe("selectLang", () => {
    it("should return 'en' if no language is specified", () => {
        expect(selectLang()).toBe("en");
    });
    it("should return 'cy' if 'cy' is specified", () => {
        expect(selectLang("cy")).toBe("cy");
    });
    it("should return 'en' for any other value", () => {
        expect(selectLang("fr")).toBe("en");
    });
});

describe("getLocalesService", () => {
    it("should return a LocalesService instance", () => {
        const service = getLocalesService();
        expect(service).toBeDefined();
        expect(service.enabled).toBe(true);
    });
});

describe("localise middleware", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;

    beforeEach(() => {
        req = { query: {} };
        res = { locals: {} };
        next = jest.fn();
    });

    it("should set res.locals with locale info (default en)", () => {
        localise(req as Request, res as Response, next);
        expect(res.locals!.languageEnabled).toBe(true);
        expect(res.locals!.languages).toEqual(["en", "cy"]);
        expect(res.locals!.i18n).toEqual({ test: "value" });
        expect(res.locals!.lang).toBe("en");
        expect(next).toHaveBeenCalled();
    });

    it("should set res.locals with locale info (cy)", () => {
        req.query = { lang: "cy" };
        localise(req as Request, res as Response, next);
        expect(res.locals!.lang).toBe("cy");
        expect(next).toHaveBeenCalled();
    });
});

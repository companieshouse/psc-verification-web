import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { localise } from "../../src/middleware/localise";

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

describe("localise middleware integration", () => {
    let app: express.Express;

    beforeEach(() => {
        app = express();
        app.use((req: Request, res: Response, next: NextFunction) => {
            // Add res.locals for compatibility
            res.locals = {};
            next();
        });
        app.use(localise);
        app.get("/", (req: Request, res: Response) => {
            res.json(res.locals);
        });
    });

    it("should set default language to en", async () => {
        const res = await request(app).get("/");
        expect(res.body.languageEnabled).toBe(true);
        expect(res.body.languages).toEqual(["en", "cy"]);
        expect(res.body.i18n).toEqual({ test: "value" });
        expect(res.body.lang).toBe("en");
    });

    it("should set language to cy if lang=cy is provided", async () => {
        const res = await request(app).get("/?lang=cy");
        expect(res.body.lang).toBe("cy");
    });
});

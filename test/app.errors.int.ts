import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { getLocalesService } from "../src/utils/localise";
import app from "../src/app";
import * as config from "../src/config";
import { servicePathPrefix } from "../src/constants";

const localesService = getLocalesService();

jest.mock("ioredis");
jest.mock("../src/config", () => ({
    env: {
        SERVICE_LIVE: null,
        COOKIE_DOMAIN: "chs.local",
        COOKIE_NAME: "__SID",
        COOKIE_SECRET: "123456789012345678901234",
        LOG_LEVEL: "debug",
        DEFAULT_SESSION_EXPIRATION: "3600",
        CACHE_SERVER: "cache_server",
        IDV_IMPLEMENTATION_DATE: "20250901"
    }
}));

const mockConfig = config as {
    env: {
        SERVICE_LIVE: string,
        COOKIE_DOMAIN: string,
        COOKIE_NAME: string,
        COOKIE_SECRET: string,
        LOG_LEVEL: string,
        DEFAULT_SESSION_EXPIRATION: string,
        CACHE_SERVER: string,
        IDV_IMPLEMENTATION_DATE: string
    }
};

const mockStartHandlerGet = jest.fn();

jest.mock("../src/routers/handlers/start/startHandler", () => {
    return jest.fn().mockImplementation(() => ({
        executeGet: mockStartHandlerGet
    }));
});

describe("Service unexpected Error handling", () => {

    it("should show 'Service Error' page when an async Promise is rejected", async () => {
        mockConfig.env.SERVICE_LIVE = "true";
        mockStartHandlerGet.mockRejectedValueOnce("GET failed (async)");

        const resp = await request(app).get(servicePathPrefix);

        expect(resp.status).toBe(HttpStatusCode.InternalServerError);
        const $ = cheerio.load(resp.text);
        expect($("h1.govuk-heading-l").text()).toContain(localesService.i18nCh.resolveSingleKey("500_main_title", "en"));
    });

    it("should show 'Service Error' page when a sync Error is thrown", async () => {
        mockConfig.env.SERVICE_LIVE = "true";
        mockStartHandlerGet.mockImplementation(() => {
            throw new Error("GET failed (sync)");
        });

        const resp = await request(app).get(servicePathPrefix);

        expect(resp.status).toBe(HttpStatusCode.InternalServerError);
        const $ = cheerio.load(resp.text);
        expect($("h1.govuk-heading-l").text()).toContain(localesService.i18nCh.resolveSingleKey("500_main_title", "en"));
    });
});

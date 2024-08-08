import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import app from "../src/app";
import * as config from "../src/config";
import { servicePathPrefix } from "../src/constants";

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

const mockConfig = config as { env: {
    SERVICE_LIVE: string,
    COOKIE_DOMAIN: string,
    COOKIE_NAME: string,
    COOKIE_SECRET: string,
    LOG_LEVEL: string,
    DEFAULT_SESSION_EXPIRATION: string,
    CACHE_SERVER: string,
    IDV_IMPLEMENTATION_DATE: string
}};

describe("Service not live integration tests", () => {

    it("should render the Service not live page when SERVICE_LEVEL is false", async () => {
        mockConfig.env.SERVICE_LIVE = "false";
        const resp = await request(app).get(servicePathPrefix);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        const $ = cheerio.load(resp.text);
        expect($("p.govuk-body").text()).toMatch("This service is not yet available");
    });

    it("should render the Start page when SERVICE_LEVEL is true", async () => {
        mockConfig.env.SERVICE_LIVE = "true";
        const resp = await request(app).get(servicePathPrefix);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        const $ = cheerio.load(resp.text);
        expect($("p.govuk-body-l").text()).toContain("Use this service");
    });
});

import * as cheerio from "cheerio";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { HttpStatusCode } from "axios";

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
});

describe("AccessibilityStatement router/handler integration tests", () => {
    it("should render the accessibility statement page with correct heading and status", async () => {
        const resp = await request(app).get(PrefixedUrls.ACCESSIBILITY_STATEMENT);
        expect(resp.status).toBe(HttpStatusCode.Ok);
        const $ = cheerio.load(resp.text);
        expect($("h1.govuk-heading-l").length).toBe(1);
        expect($("h1.govuk-heading-l").text()).toMatch("Accessibility statement for the provide identity verification details for a PSC service");
    });
});

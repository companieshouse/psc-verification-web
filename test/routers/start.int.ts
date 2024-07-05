import * as cheerio from "cheerio";
import middlewareMocks from "../mocks/allMiddleware.mock";
import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls, servicePathPrefix } from "../../src/constants";
import { HttpStatusCode } from "axios";

describe("Start router/handler integration tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(middlewareMocks.mockFetchCompanyMiddleware).not.toHaveBeenCalled();
        expect(middlewareMocks.mockFetchVerificationMiddleware).not.toHaveBeenCalled();
    });

    const HEADING = "Provide identity verification details for a PSC or relevant legal entity";

    describe("GET method", () => {

        it("should render the start page for service root URL", async () => {
            const resp = await request(app).get(servicePathPrefix);

            expect(resp.status).toBe(HttpStatusCode.Ok);
            const $ = cheerio.load(resp.text);
            expect($("h1.govuk-heading-l").text()).toMatch(HEADING);
        });

        it("should render the start page for /start URL", async () => {
            const resp = await request(app).get(PrefixedUrls.START);

            expect(resp.status).toBe(HttpStatusCode.Ok);
            const $ = cheerio.load(resp.text);
            expect($("h1.govuk-heading-l").text()).toMatch(HEADING);
        });
    });
});

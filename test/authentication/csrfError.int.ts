import request from "supertest";
import * as cheerio from "cheerio";
import { HttpStatusCode } from "axios";
import { PrefixedUrls } from "../../src/constants";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../mocks/authenticationMiddleware.mock";
import { csrfProtectionMiddleware } from "../../src/middleware/csrf";
import app from "../../src/app";
import { CsrfError } from "@companieshouse/web-security-node";

jest.mock("../../src/middleware/csrf");

const mockCsrfThrowingMiddleware = csrfProtectionMiddleware as jest.Mock;

describe("CSRF violation handling", () => {

    beforeEach(() => {
        mockAuthenticationMiddleware.mockClear();
        mockSessionMiddleware.mockClear();
    });

    it("Should render the CSRF error page", async () => {
        mockCsrfThrowingMiddleware.mockImplementation(() => { throw new CsrfError("CSRF token mismatch"); });

        const response = await request(app)
            .get(PrefixedUrls.START);
        const $ = cheerio.load(response.text);

        expect(response.status).toBe(HttpStatusCode.Forbidden);
        expect($("h1.govuk-heading-l").text()).toMatch("something went wrong");
    });

});

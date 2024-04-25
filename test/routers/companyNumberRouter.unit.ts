import middlewareMocks from "./../mocks/allMiddleware.mock";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";
import app from "./../../src/app";
import { HttpStatusCode } from "axios";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("company number router tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the company lookup screen with a found redirect status code", async () => {
        const resp = await request(app).get(PrefixedUrls.COMPANY_NUMBER);
        expect(resp.status).toBe(HttpStatusCode.Found);
    });

    it("Should redirect to the company lookup screen", async () => {
        const resp = await request(app).get(PrefixedUrls.COMPANY_NUMBER);
        expect(resp.text).toContain("Redirecting to /company-lookup/search");
    });

});

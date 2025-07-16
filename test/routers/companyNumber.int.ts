import middlewareMocks from "../mocks/allMiddleware.mock";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";
import app from "../../src/app";
import { HttpStatusCode } from "axios";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("CompanyNumber router/handler integration tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    describe("GET method", () => {

        it("Should redirect to the company lookup screen", async () => {
            const resp = await request(app).get(PrefixedUrls.COMPANY_NUMBER)
                .expect(HttpStatusCode.Found);

            const encodedURI = "/company-lookup/search?forward=%2Fpersons-with-significant-control-verification%2Fconfirm-company%3FcompanyNumber%3D%7BcompanyNumber%7D%26lang%3Den&lang=en";
            expect(resp.text).toBe(`Found. Redirecting to ${encodedURI}`);
        });
    });

});

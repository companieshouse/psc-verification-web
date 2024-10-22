import middlewareMocks from "../mocks/allMiddleware.mock";
import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { HttpStatusCode } from "axios";

jest.mock("ioredis");

describe("Healthcheck integration tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    describe("GET method", () => {

        it("should return status 200 and content 'OK'", async () => {
            const resp = await request(app).get(PrefixedUrls.HEALTHCHECK);

            expect(resp.status).toBe(HttpStatusCode.Ok);
            expect(resp.text).toBe("OK");
        });

    });
});

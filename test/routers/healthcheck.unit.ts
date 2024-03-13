import app from "../../src/app";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";

describe("healthcheck tests", () => {
    it("should show status 200", async () => {
        const resp = await request(app).get(PrefixedUrls.HEALTHCHECK);

        // Insert when we have a heathcheck to call.
        // expect(resp.status).toBe(200);
    });
});

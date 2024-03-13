import app from "../../src/app";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";

describe("start page tests", () => {
    const HEADING = "PSC Verification";
    it("should render the start page", async () => {
        const resp = await request(app).get(PrefixedUrls.START);

        expect(resp.status).toBe(200);
        expect(resp.text).toContain(HEADING);
    });
});

import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import middlewareMocks from "../mocks/all.middleware.mock";

describe("start page tests", () => {
    const HEADING = "PSC Verification";
    it("should render the start page", async () => {
        const resp = await request(app).get(PrefixedUrls.START);

        expect(resp.status).toBe(200);
        expect(resp.text).toContain(HEADING);
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalled();
    });
});

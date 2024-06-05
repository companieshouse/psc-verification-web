import middlewareMocks from "../mocks/allMiddleware.mock";
import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls, servicePathPrefix } from "../../src/constants";
import { HttpStatusCode } from "axios";

describe("start page tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const HEADING = "Provide identity verification details for a PSC or relevant legal entity";
    it("should render the start page for service root", async () => {
        const resp = await request(app).get(servicePathPrefix);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect(resp.text).toContain(HEADING);
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("should render the start page for Start", async () => {
        const resp = await request(app).get(PrefixedUrls.START);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect(resp.text).toContain(HEADING);
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });
});

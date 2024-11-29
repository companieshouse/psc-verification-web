import { HttpStatusCode } from "axios";
import request from "supertest";
import { PrefixedUrls, STOP_TYPE } from "../../src/constants";
import middlewareMocks from "../mocks/allMiddleware.mock";
import app from "../../src/app";
import { getUrlWithStopType } from "../../src/utils/url";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("individual statement tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it.each(Object.values(STOP_TYPE))("Should render the stop screen '%s' with a successful status code", async (stopType: STOP_TYPE) => {
        const resp = await request(app).get(getUrlWithStopType(PrefixedUrls.STOP_SCREEN, stopType));
        expect(resp.status).toBe(HttpStatusCode.Ok);
    });

});

import middlewareMocks from "../mocks/allMiddleware.mock";
import request from "supertest";
import app from ".../../../src/app";
import { PrefixedUrls } from ".../../../src/constants";

jest.mock(".../../../src/services/companyProfileService");

describe("Authentication checked on all pages except for the start page", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it(`Should not authenticate when navigating to '${PrefixedUrls.START}'`, async () => {
        const resp = await request(app).get(PrefixedUrls.START);

        expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    // TODO -  Add tests for the RLE journey pages
    it.each([PrefixedUrls.CONFIRM_COMPANY,
        PrefixedUrls.PSC_TYPE,
        PrefixedUrls.INDIVIDUAL_PSC_LIST,
        PrefixedUrls.INDIVIDUAL_STATEMENT,
        PrefixedUrls.PSC_VERIFIED])("Should authenticate when navigating to '%s'", async (url) => {
        const resp = await request(app).get(url);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

});

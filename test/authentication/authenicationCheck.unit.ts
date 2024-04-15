import request from "supertest";
import app from ".../../../src/app";
import { PrefixedUrls } from ".../../../src/constants";
import middlewareMocks from "../mocks/allMiddleware.mock";

jest.mock(".../../../src/services/companyProfileService");

describe("Authenticated users only can access the PSC verification web pages except for the start page", () => {

    beforeEach(() => {
        middlewareMocks.mockAuthenticationMiddleware.mockClear();
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should not call the authentication middleware when navigating to the start page", async () => {
        const resp = await request(app).get(PrefixedUrls.START);
        expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it("Should call the authentication middleware once for the confirm company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should call the authentication middleware once for the psc type page ", async () => {
        const resp = await request(app).get(PrefixedUrls.PSC_TYPE);
        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should call the authentication middleware once for the individual psc list page ", async () => {
        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST);
        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    // TODO - test for the psc details page

    it("Should call the authentication middleware once for the individual psc statement page ", async () => {
        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_STATEMENT);
        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should call the authentication middleware once for the psc verified page ", async () => {
        const resp = await request(app).get(PrefixedUrls.PSC_VERIFIED);
        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    // TODO -  Add tests for the RLE journey pages

});

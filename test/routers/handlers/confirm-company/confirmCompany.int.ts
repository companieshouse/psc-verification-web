import request from "supertest";
import * as cheerio from "cheerio";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";

const COMPANY_NUMBER = "12345678";

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

describe("confirm company tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the Confirm Company page with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.status).toBe(200);
    });

    it("Should display 'Confirm this is the correct company' message on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);

        const $ = cheerio.load(resp.text);
        expect($("h1").text()).toBe("Confirm this is the correct company");
    });

    it("Should include a 'Confirm and continue' button on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);

        const $ = cheerio.load(resp.text);
        expect($("button#submit").text()).toContain("Confirm and continue");
    });

    it("Should include a 'Choose a different company' button link on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);

        const $ = cheerio.load(resp.text);
        expect($("a#select-different-company").attr("href")).toBe("/persons-with-significant-control-verification/company-number?lang=en");
    });
});

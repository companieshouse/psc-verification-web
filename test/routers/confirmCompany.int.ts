import request from "supertest";
import * as cheerio from "cheerio";
import middlewareMocks from "../mocks/allMiddleware.mock";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { HttpStatusCode } from "axios";
import { COMPANY_NUMBER } from "../mocks/companyPsc.mock";

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

describe("ConfirmCompany router/handler integration tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    describe("GET method", () => {

        it("Should render the Confirm Company page with a successful status code and content", async () => {
            const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY)
                .expect(HttpStatusCode.Ok);
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

    describe("POST method", () => {

        it("Should redirect to the psc-list router with a temporary redirect status code", async () => {
            const lang = "en";
            const expectedRedirectUrl = `/persons-with-significant-control-verification/individual/psc-list?companyNumber=${COMPANY_NUMBER}&lang=${lang}`;

            await request(app)
                .post(PrefixedUrls.CONFIRM_COMPANY)
                .send({ lang: "en", companyNumber: `${COMPANY_NUMBER}` })
                .expect(HttpStatusCode.Found)
                .expect("Location", expectedRedirectUrl);
        });
    });
});

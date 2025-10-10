import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { URLSearchParams } from "url";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { COMPANY_NUMBER, INDIVIDUAL_PSCS_LIST } from "../../../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getCompanyIndividualPscList } from "../../../../src/services/companyPscService";

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

jest.mock("../../../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValue(INDIVIDUAL_PSCS_LIST);
jest.mock("../../../../src/services/pscService");

describe("individual PSC list view", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyIndividualPscList).toHaveBeenCalledTimes(1);
    });

    it("Should render the Individual PSC List page with a success status code and correct links", async () => {
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);
        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        // check page contents
        expect($("a.govuk-back-link").attr("href")).toBe(`/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en`);
        // summary cards for individual PSCs
        expect($("h1").text()).toBe("PSC identity verification status");
        expect($("h2.govuk-summary-card__title").eq(0).text()).toContain(`Mr Jim Testerly`);
        expect($("h2.govuk-summary-card__title").eq(1).text()).toContain(`Mr Test Tester Testington`);
    });

    it("Should render verify and request extension links for each PSC in canVerifyNowDetails", async () => {
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);
        const $ = cheerio.load(resp.text);

        const summaryCards = $(".govuk-summary-card");
        expect(summaryCards.length).toBeGreaterThan(0);

        // For each summary card, check for verify and request extension links
        summaryCards.each((_, card) => {
            const verifyLink = $(card).find("a[data-event-id='provide-verification-details-link']");
            const extensionLink = $(card).find("a[data-event-id='request-extension-link']");

            // Verify link should exist and have correct href
            expect(verifyLink.length).toBe(1);
            expect(verifyLink.attr("href")).toMatch(/\/persons-with-significant-control-verification\/new-submission\?companyNumber=.*&lang=.*&selectedPscId=.*/);
            expect(verifyLink.attr("href")).toContain(`companyNumber=${COMPANY_NUMBER}`);

            // Extension link should exist and have correct href
            expect(extensionLink.length).toBe(1);
            expect(extensionLink.attr("href")).toMatch(/\/persons-with-significant-control-extension\/requesting-an-extension\?companyNumber=.*&selectedPscId=.*&lang=.*/);
            expect(extensionLink.attr("href")).toContain(`companyNumber=${COMPANY_NUMBER}`);
        });
    });
});

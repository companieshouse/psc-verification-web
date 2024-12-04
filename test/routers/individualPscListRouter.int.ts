import request from "supertest";
import * as cheerio from "cheerio";
import middlewareMocks from "../mocks/allMiddleware.mock";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { getCompanyIndividualPscList } from "../../src/services/companyPscService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { COMPANY_NUMBER, INDIVIDUAL_PSCS_LIST } from "../mocks/companyPsc.mock";
import { HttpStatusCode } from "axios";

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

jest.mock("../../src/services/companyPSCService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValue(INDIVIDUAL_PSCS_LIST);

describe("GET psc individual list router", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        middlewareMocks.mockAuthenticationMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
    });

    it("Should render the PSC Individual List page with a successful status code", async () => {
        // Act
        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST + `?companyNumber=${COMPANY_NUMBER}&lang=en`);
        expect(resp.status).toBe(HttpStatusCode.Ok);
    });

    it("Should render the individual psc list page with the correct pscs", async () => {

        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST + `?companyNumber=${COMPANY_NUMBER}&lang=en`);
        const $ = cheerio.load(resp.text);
        expect($("h1").text()).toBe("PSC identity verification status");
        expect($("h2.govuk-summary-card__title").eq(0).text()).toContain(`Mr Jim Testerly`);
        expect($("h2.govuk-summary-card__title").eq(1).text()).toContain(`Mr Test Tester Testington`);
    });
});

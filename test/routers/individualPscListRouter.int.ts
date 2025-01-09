import request from "supertest";
import * as cheerio from "cheerio";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../mocks/authenticationMiddleware.mock";
import app from "../../src/app";
import { PrefixedUrls, STOP_TYPE } from "../../src/constants";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { getCompanyIndividualPscList } from "../../src/services/companyPscService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { COMPANY_NUMBER, INDIVIDUAL_PSCS_LIST, SUPER_SECURE_PSCS_EXCLUSIVE_LIST } from "../mocks/companyPsc.mock";
import { HttpStatusCode } from "axios";
import { getUrlWithStopType } from "../../src/utils/url";

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

jest.mock("../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;

describe("GET psc individual list router", () => {
    beforeEach(() => {
    });

    it("Should return with a successful status code", async () => {
        mockGetCompanyIndividualPscList.mockResolvedValue(INDIVIDUAL_PSCS_LIST);

        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST + `?companyNumber=${COMPANY_NUMBER}&lang=en`);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyIndividualPscList).toHaveBeenCalledTimes(1);
    });

    it("Should render PSC List screen for ordinary PSCs only, when Super Secure are present", async () => {
        const ordinaryAndSuperSecurePscs = [...INDIVIDUAL_PSCS_LIST, ...SUPER_SECURE_PSCS_EXCLUSIVE_LIST];

        mockGetCompanyIndividualPscList.mockResolvedValue(ordinaryAndSuperSecurePscs);

        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST + `?companyNumber=${COMPANY_NUMBER}&lang=en`);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        const $ = cheerio.load(resp.text);
        const pscNameCardTitles = [...$("div.govuk-summary-card__title-wrapper > h2").contents()].map(e => $(e).text().trim());
        const templatePlaceholderName = "[Name of the psc]";
        const expectedPscNames = [...INDIVIDUAL_PSCS_LIST.map(p => p.name), templatePlaceholderName];
        expect(pscNameCardTitles).toMatchObject(expectedPscNames);
    });

    it("Should redirect to super-secure stop screen if PSCs are exclusively Super Secure", async () => {
        mockGetCompanyIndividualPscList.mockResolvedValue(SUPER_SECURE_PSCS_EXCLUSIVE_LIST);

        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST + `?companyNumber=${COMPANY_NUMBER}&lang=en`);

        expect(resp.status).toBe(HttpStatusCode.Found);
        expect(resp.header.location).toBe(`${getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.SUPER_SECURE)}?companyNumber=12345678&lang=en`);
    });
});

import { HttpStatusCode } from "axios";
import request from "supertest";
import { URLSearchParams } from "url";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../mocks/authenticationMiddleware.mock";
import app from "../../src/app";
import { PrefixedUrls, STOP_TYPE } from "../../src/constants";
import { COMPANY_NUMBER, INDIVIDUAL_PSCS_LIST } from "../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { getCompanyIndividualPscList } from "../../src/services/companyPscService";
import { getUrlWithStopType } from "../../src/utils/url";

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
jest.mock("../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValueOnce(INDIVIDUAL_PSCS_LIST);

jest.mock("../../src/services/pscService");

describe("CheckCompany middleware", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
    });

    it.each(["dissolved", "converted-closed"])("Should redirect to the Stop Screen for Company Status '%s'", async (status) => {
        const amendedStatusCompanyProfile = { ...validCompanyProfile };
        amendedStatusCompanyProfile.companyStatus = status;
        mockGetCompanyProfile.mockResolvedValue(amendedStatusCompanyProfile);
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);

        expect(resp.status).toBe(HttpStatusCode.Found);
        expect(resp.header.location).toBe(`${getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.COMPANY_STATUS)}?companyNumber=12345678&lang=en`);
    });

    it("Should redirect to the Stop Screen for Company Type 'unknown'", async () => {
        const amendedTypeCompanyProfile = { ...validCompanyProfile };
        amendedTypeCompanyProfile.type = "unknown";
        mockGetCompanyProfile.mockResolvedValue(amendedTypeCompanyProfile);
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);

        expect(resp.status).toBe(HttpStatusCode.Found);
        expect(resp.header.location).toBe(`${getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.COMPANY_TYPE)}?companyNumber=12345678&lang=en`);
    });

    it("Should proceed to the PSC List screen for valid company profile", async () => {
        mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect(resp.text.includes("PSC identity verification status")).toBe(true);
    });

});

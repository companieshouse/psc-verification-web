import { HttpStatusCode } from "axios";
import request from "supertest";
import { URLSearchParams } from "url";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "..//mocks/authenticationMiddleware.mock";
import app from "../../src/app";
import { PrefixedUrls, STOP_TYPE } from "../../src/constants";
import { COMPANY_NUMBER, INDIVIDUAL_PSCS_LIST } from "../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { getCompanyIndividualPscList } from "../../src/services/companyPscService";
import { getUrlWithStopType } from "../../src/utils/url";

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
const dissolvedCompany = validCompanyProfile;
dissolvedCompany.companyStatus = "dissolved";
const unknownTypeCompany = validCompanyProfile;
unknownTypeCompany.type = "unknownType";
mockGetCompanyProfile.mockResolvedValueOnce(dissolvedCompany).mockResolvedValueOnce(unknownTypeCompany);

jest.mock("../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValueOnce(INDIVIDUAL_PSCS_LIST);

describe("individual PSC list view", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
    });

    it("Should redirect to the Stop Screen for Company Status", async () => {
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);

        expect(resp.status).toBe(HttpStatusCode.Found);
        expect(resp.header.location).toBe(`${getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.COMPANY_STATUS)}?companyNumber=12345678&lang=en`);
    });

    it.skip("Should redirect to the Stop Screen for Company Type", async () => {
        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`;

        const resp = await request(app).get(uriWithQuery);

        expect(resp.status).toBe(HttpStatusCode.Found);
        expect(resp.header.location).toBe(`${getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.COMPANY_TYPE)}?companyNumber=12345678&lang=en`);
    });

});

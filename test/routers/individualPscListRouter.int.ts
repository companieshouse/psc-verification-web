import request from "supertest";
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
        expect(mockGetCompanyIndividualPscList).toHaveBeenCalledTimes(1);
    });

    it("Should return with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST + `?companyNumber=${COMPANY_NUMBER}&lang=en`);
        expect(resp.status).toBe(HttpStatusCode.Ok);
    });
});

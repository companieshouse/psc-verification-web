import request from "supertest";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../mocks/authenticationMiddleware.mock";
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

jest.mock("../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValue(INDIVIDUAL_PSCS_LIST);

describe("GET psc individual list router", () => {
    beforeEach(() => {
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyIndividualPscList).toHaveBeenCalledTimes(1);
    });

    it("Should return with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST + `?companyNumber=${COMPANY_NUMBER}&lang=en`);
        expect(resp.status).toBe(HttpStatusCode.Ok);
    });
});

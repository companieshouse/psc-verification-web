import { HttpStatusCode } from "axios";
import request from "supertest";
import mockAuthenticationMiddleware from "../mocks/authenticationMiddleware.mock";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { getCompanyIndividualPscList } from "../../src/services/companyPscService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { COMPANY_NUMBER, VALID_COMPANY_IND_PSC_LIST } from "../mocks/companyPsc.mock";

jest.mock("../../src/services/companyProfileService", () => ({
    getCompanyProfile: jest.fn()
}));

jest.mock("../../src/services/companyPscService", () => ({
    getCompanyIndividualPscList: jest.fn()
}));

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    expect(getCompanyProfile).toHaveBeenCalledTimes(1);
    expect(getCompanyIndividualPscList).toHaveBeenCalledTimes(1);
});

describe("psc individual list get tests", () => {

    it.skip("Should render the PSC Individual List page with a successful status code", async () => {
        // Arrange
        (getCompanyProfile as jest.Mock).mockReturnValue(validCompanyProfile);
        (getCompanyIndividualPscList as jest.Mock).mockReturnValue(VALID_COMPANY_IND_PSC_LIST);

        // Act
        await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST)
            .query({ companyNumber: `${COMPANY_NUMBER}`, lang: "en" })
            .expect(HttpStatusCode.Ok);

    });
});

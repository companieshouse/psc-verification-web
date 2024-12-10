import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { COMPANY_NUMBER, badRequestSDKResource, missingSDKResource, validCompanyProfile, validSDKResource } from "../mocks/companyProfile.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockGetCompanyProfile = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;
mockCreateOAuthApiClient.mockReturnValue({
    companyProfile: {
        getCompanyProfile: mockGetCompanyProfile
    }
});

describe("CompanyProfileService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyProfile).toHaveBeenCalledTimes(1);
    });

    describe("getPscVerification", () => {
        it("should retrieve the company profile resource", async () => {
            const mockResponse = validSDKResource;
            mockGetCompanyProfile.mockResolvedValueOnce(mockResponse);
            const request = {} as Request;

            const response = await getCompanyProfile(request, COMPANY_NUMBER);

            expect(response).toEqual(validCompanyProfile);

        });

        it("should return an error if the HttpStatusCode is not 200", async () => {
            const mockResponse = badRequestSDKResource;
            mockGetCompanyProfile.mockResolvedValueOnce(mockResponse);
            const request = {} as Request;

            await expect(getCompanyProfile(request, COMPANY_NUMBER)).rejects.toThrow(
                new Error(`getCompanyProfile -HTTP status code 400 - Failed to get company profile for company number ${COMPANY_NUMBER}`)
            );
        });

        it("should return an error if no company profile is found", async () => {
            const mockResponse = undefined;
            mockGetCompanyProfile.mockResolvedValueOnce(mockResponse);
            const request = {} as Request;

            await expect(getCompanyProfile(request, COMPANY_NUMBER)).rejects.toThrow(
                new Error(`getCompanyProfile - Company Profile API returned no response for company number ${COMPANY_NUMBER}`)
            );
        });

        it("should return an error if no response is return", async () => {
            const mockResponse = missingSDKResource;
            mockGetCompanyProfile.mockResolvedValueOnce(mockResponse);
            const request = {} as Request;

            await expect(getCompanyProfile(request, COMPANY_NUMBER)).rejects.toThrow(
                new Error(`getCompanyProfile - Company Profile API returned no resource for company number ${COMPANY_NUMBER}`)
            );
        });
    });
});

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile, RegisteredOfficeAddress } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import logger from "../../lib/Logger";

export const getCompanyProfile = async (companyNumber: string): Promise<CompanyProfile> => {
    const apiClient = createApiClient(process.env.CHS_API_KEY);

    logger.debug(`Looking for company profile with company number ${companyNumber}`);
    const sdkResponse: Resource<CompanyProfile> = await apiClient.companyProfile.getCompanyProfile(companyNumber);

    if (!sdkResponse) {
        throw logger.info(`Company Profile API returned no response for company number ${companyNumber}`);
    }

    if (sdkResponse.httpStatusCode >= 400) {
        throw logger.info(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company profile for company number ${companyNumber}`);
    }

    if (!sdkResponse.resource) {
        throw logger.info(`Company Profile API returned no resource for company number ${companyNumber}`);
    }

    logger.debug(`Received company profile ${JSON.stringify(sdkResponse)}`);

    return sdkResponse.resource;
};

export const mapCompanyProfileToOfficerFilingAddress = (registeredOffice: RegisteredOfficeAddress) => {
    if (!registeredOffice) {
        return;
    }
    return {
        addressLine1: registeredOffice.addressLineOne,
        addressLine2: registeredOffice.addressLineTwo,
        careOf: registeredOffice.careOf,
        country: registeredOffice.country,
        locality: registeredOffice.locality,
        poBox: registeredOffice.poBox,
        postalCode: registeredOffice.postalCode,
        premises: registeredOffice.premises,
        region: registeredOffice.region
    };
};

import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import logger from "../../lib/Logger";
import { env } from "../../config";

export const getCompanyProfile = async (companyNumber: string): Promise<CompanyProfile> => {
    const apiClient = createApiClient(env.CHS_API_KEY, undefined, env.API_URL);

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

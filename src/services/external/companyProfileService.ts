import { Resource, createApiClient } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Session } from "@companieshouse/node-session-handler";
import { Request } from "express";
import { logger } from "../../lib/logger";
import { getAccessToken } from "../../utils/session";

export const getCompanyProfile = async (req: Request): Promise<CompanyProfile> => {

    const accessToken: string = getAccessToken(req.session as Session);
    const apiClient = createApiClient(undefined, accessToken, undefined);
    const companyNumber = req.query.companyNumber as string;

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

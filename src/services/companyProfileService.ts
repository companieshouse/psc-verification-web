import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "./apiClientService";
import { createAndLogError, logger } from "../lib/logger";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

export const getCompanyProfile = async (request: Request, companyNumber: string): Promise<CompanyProfile> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`${getCompanyProfile.name} - Get company profile with company number ${companyNumber}`);
    const sdkResponse: Resource<CompanyProfile> | ApiErrorResponse = await oAuthApiClient.companyProfile.getCompanyProfile(companyNumber);

    if (!sdkResponse) {
        throw createAndLogError(`${getCompanyProfile.name} - Company Profile API returned no response for company number ${companyNumber}`);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getCompanyProfile.name} -HTTP status code ${sdkResponse.httpStatusCode} - Failed to get company profile for company number ${companyNumber}`);
    }

    const castedSdkResponse = sdkResponse as Resource<CompanyProfile>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`${getCompanyProfile.name} - Company Profile API returned no resource for company number ${companyNumber}`);
    }

    logger.debug(`${getCompanyProfile.name} - Received company profile ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse.resource;
};

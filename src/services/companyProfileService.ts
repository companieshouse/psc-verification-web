import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "./apiClientService";
import { logger } from "../lib/logger";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

export const getCompanyProfile = async (request: Request, companyNumber: string): Promise<CompanyProfile> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`Get company profile with companyNumber="${companyNumber}"`);
    const sdkResponse: Resource<CompanyProfile> | ApiErrorResponse = await oAuthApiClient.companyProfile.getCompanyProfile(companyNumber);

    if (!sdkResponse) {
        throw new Error(`Company Profile API returned no response for companyNumber="${companyNumber}"`);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw new Error(`HTTP status code ${sdkResponse.httpStatusCode} - Failed to get company profile for companyNumber="${companyNumber}"`);
    }

    const castedSdkResponse = sdkResponse as Resource<CompanyProfile>;

    if (!castedSdkResponse.resource) {
        throw new Error(`Company Profile API returned no resource for companyNumber="${companyNumber}"`);
    }

    logger.debug(`Successfully received company profile with companyNumber="${companyNumber}"`);

    return castedSdkResponse.resource;
};

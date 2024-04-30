import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { Request } from "express";
import { logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";

export const getCompanyPscList = async (request: Request): Promise<Resource<CompanyPersonsWithSignificantControlResource>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const companyNumber = request.query.companyNumber as string;

    logger.debug(`Get CompanyPersonsWithSignificationControlResource resource for company number ${companyNumber}`);
    const sdkResponse: Resource<CompanyPersonsWithSignificantControlResource> | ApiErrorResponse = await oAuthApiClient.companyPsc.getCompanyPsc(companyNumber);

    if (!sdkResponse) {
        throw logger.info(`Company PSC Data API returned no response for company number ${companyNumber}`);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw logger.info(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company psc list for company number ${companyNumber}`);
    }

    logger.debug(`Received company psc list ${JSON.stringify(sdkResponse)}`);
    const companyPscsSdkResponse = sdkResponse as Resource<CompanyPersonsWithSignificantControlResource>;

    if (!companyPscsSdkResponse.resource) {
        throw logger.info("add in some logging here");
    }

    return companyPscsSdkResponse;
};

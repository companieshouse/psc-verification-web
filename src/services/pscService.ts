import { Request } from "express";
import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { logger } from "../lib/logger";
import { createApiKeyClient } from "./apiClientService";
import { extractRequestIdHeader } from "../routers/utils";

export const getPscIndividual = async (request: Request, companyNumber: string, pscNotificationId: string): Promise<Resource<PersonWithSignificantControl>> => {
    const apiClient: ApiClient = createApiKeyClient();

    logger.debug(`for company with companyNumber="${companyNumber}", notificationId="${pscNotificationId}"`);
    const headers = extractRequestIdHeader(request);
    const sdkResponse: Resource<PersonWithSignificantControl> | ApiErrorResponse = await apiClient.pscService.getPscIndividual(companyNumber, pscNotificationId, headers);

    if (sdkResponse?.httpStatusCode !== HttpStatusCode.Ok) {
        if (sdkResponse?.httpStatusCode) {
            logger.error(`sdk responded with HTTP status code ${sdkResponse.httpStatusCode}`);
        }
        throw new Error(`Failed to get PSC with verification state for companyNumber="${companyNumber}", notificationId="${pscNotificationId}"`);
    }

    const PscSdkResponse = sdkResponse as Resource<PersonWithSignificantControl>;

    if (!PscSdkResponse.resource) {
        throw new Error(`no PSC with verification state returned for companyNumber="${companyNumber}", notificationId="${pscNotificationId}"`);
    }

    return PscSdkResponse;
};

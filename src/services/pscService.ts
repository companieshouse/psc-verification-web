import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { createAndLogError, logger } from "../lib/logger";
import { createApiKeyClient } from "./apiClientService";

export const getPscIndividual = async (companyNumber: string, pscNotificationId: string): Promise<Resource<PersonWithSignificantControl>> => {
    const apiClient: ApiClient = createApiKeyClient();

    logger.debug(`${getPscIndividual.name} - for companyNumber: ${companyNumber} and PSC notification ID: ${pscNotificationId}`);
    const sdkResponse: Resource<PersonWithSignificantControl> | ApiErrorResponse = await apiClient.pscService.getPscIndividual(companyNumber, pscNotificationId);

    if (sdkResponse?.httpStatusCode !== HttpStatusCode.Ok) {
        if (sdkResponse?.httpStatusCode) {
            logger.error(`${getPscIndividual.name} - sdk responded with HTTP status code: ${sdkResponse.httpStatusCode}`);
        }
        throw createAndLogError(`${getPscIndividual.name} -  Failed to get PSC with verification state for companyNumber: ${companyNumber} and PSC notification ID: ${pscNotificationId}`);
    }

    logger.debug(`${getPscIndividual.name} - response: ${JSON.stringify(sdkResponse)}`);
    const PscSdkResponse = sdkResponse as Resource<PersonWithSignificantControl>;

    if (!PscSdkResponse.resource) {
        throw createAndLogError(`${getPscIndividual.name} - no PSC with verification state returned for companyNumber: ${companyNumber} and PSC notification ID: ${pscNotificationId}`);
    }

    return PscSdkResponse;
};

import { Request } from "express";
import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PscVerification, PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { Session } from "@companieshouse/node-session-handler";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createOAuthApiClient } from "services/external/apiClientService";
import { createAndLogError, logger } from "utils/logger";

export const createPscVerification = async (request: Request, session: Session, transactionId: string, pscVerification: PscVerification): Promise<PscVerificationResource> => {
    const apiClient: ApiClient = createOAuthApiClient(session);

    logger.debug(`Posting PSC verification for transaction ${transactionId}`);
    const sdkResponse: Resource<PscVerificationResource> | ApiErrorResponse = await apiClient.pscVerificationService.postPscVerification(transactionId, pscVerification);

    if (!sdkResponse) {
        throw createAndLogError(`PSC Verification POST request returned no response for transaction ${transactionId}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
        throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to POST PSC Verification for transaction ${transactionId}`);
    }

    const castedSdkResponse: Resource<PscVerificationResource> = sdkResponse as Resource<PscVerificationResource>;
    if (!castedSdkResponse.resource) {
        throw createAndLogError(`PSC Verification API POST request returned no resource for transaction ${transactionId}`);
    }

    logger.debug(`Posted PSC Verification ${JSON.stringify(sdkResponse)}`);
    return castedSdkResponse.resource;
};

import { Request } from "express";
import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { createOAuthApiClient } from "./apiClientService";
import { PscVerification, PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { createAndLogError, logger } from "../lib/Logger";

export const createPscVerification = async (request: Request, transaction: Transaction, pscVerification: PscVerification): Promise<PscVerificationResource> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`Creating PSC verification resource for ${transaction.description} transaction ${transaction.id}`);
    const sdkResponse: Resource<PscVerificationResource> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.postPscVerification(transaction.id as string, pscVerification);

    if (!sdkResponse) {
        throw createAndLogError(`PSC Verification POST request returned no response for transaction ${transaction.id}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
        throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to POST PSC Verification for transaction ${transaction.id}`);
    }

    const castedSdkResponse: Resource<PscVerificationResource> = sdkResponse as Resource<PscVerificationResource>;
    if (!castedSdkResponse.resource) {
        throw createAndLogError(`PSC Verification API POST request returned no resource for transaction ${transaction.id}`);
    }
    logger.debug(`POST PSC Verification response: ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse.resource;
};

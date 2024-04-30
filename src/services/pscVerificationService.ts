import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PscVerification, PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";

export const createPscVerification = async (request: Request, transaction: Transaction, pscVerification: PscVerification): Promise<Resource<PscVerificationResource>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`Creating PSC verification resource for ${transaction.description} transaction ${transaction.id}`);
    const sdkResponse: Resource<PscVerificationResource> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.postPscVerification(transaction.id as string, pscVerification);

    if (!sdkResponse) {
        throw createAndLogError(`PSC Verification POST request returned no response for transaction ${transaction.id}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Created) {
        throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to POST PSC Verification for transaction ${transaction.id}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerificationResource>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`PSC Verification API POST request returned no resource for transaction ${transaction.id}`);
    }
    logger.debug(`POST PSC Verification response: ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse;
};

export const getPscVerification = async (request: Request, transactionId: string, pscVerificationId: string): Promise<Resource<PscVerificationResource>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transaction ${transactionId}`;

    logger.debug(`Retrieving PSC verification for ${logReference}`);
    const sdkResponse: Resource<PscVerificationResource> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.getPscVerification(transactionId, pscVerificationId);

    if (!sdkResponse) {
        throw createAndLogError(`PSC Verification GET request returned no response for ${logReference}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to GET PSC Verification for ${logReference}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerificationResource>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`PSC Verification API GET request returned no resource for ${logReference}`);
    }
    logger.debug(`GET PSC Verification response: ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse;
};

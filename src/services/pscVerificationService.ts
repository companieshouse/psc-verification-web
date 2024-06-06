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

    logger.debug(`${createPscVerification.name} - Creating PSC verification resource for ${transaction.description} transaction ${transaction.id}`);
    const sdkResponse: Resource<PscVerificationResource> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.postPscVerification(transaction.id as string, pscVerification);

    if (!sdkResponse) {
        throw createAndLogError(`${createPscVerification.name} - PSC Verification POST request returned no response for transaction ${transaction.id}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Created) {
        throw createAndLogError(`${createPscVerification.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to POST PSC Verification for transaction ${transaction.id}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerificationResource>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`${createPscVerification.name} - PSC Verification API POST request returned no resource for transaction ${transaction.id}`);
    }
    logger.debug(`${createPscVerification.name} - POST PSC Verification response: ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse;
};

export const getPscVerification = async (request: Request, transactionId: string, pscVerificationId: string): Promise<Resource<PscVerificationResource>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transaction ${transactionId}`;

    logger.debug(`${getPscVerification.name} - Retrieving PSC verification for ${logReference}`);
    const sdkResponse: Resource<PscVerificationResource> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.getPscVerification(transactionId, pscVerificationId);

    if (!sdkResponse) {
        throw createAndLogError(`${getPscVerification.name} - PSC Verification GET request returned no response for ${logReference}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getPscVerification.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to GET PSC Verification for ${logReference}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerificationResource>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`${getPscVerification.name} - PSC Verification API GET request returned no resource for ${logReference}`);
    }
    logger.debug(`${getPscVerification.name} - GET PSC Verification response: ${sdkResponse.httpStatusCode}`);

    return castedSdkResponse;
};

export const patchPscVerification = async (request: Request, transactionId: string, pscVerificationId: string, pscVerification: PscVerification): Promise<Resource<PscVerificationResource>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transactionId ${transactionId} and pscVerificationId ${pscVerificationId}`;

    logger.debug(`${patchPscVerification.name} - Patching PSC verification resource with ${logReference}`);
    const sdkResponse: Resource<PscVerificationResource> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.patchPscVerification(transactionId as string, pscVerificationId as string, pscVerification);

    if (!sdkResponse) {
        throw createAndLogError(`${patchPscVerification.name} - PSC Verification PATCH request returned no response for resource with ${logReference}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${patchPscVerification.name} - Http status code ${sdkResponse.httpStatusCode} - Failed to PATCH PSC Verification for resource with ${logReference}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerificationResource>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`PSC Verification API POST request returned no resource with ${logReference}`);
    }
    logger.debug(`${patchPscVerification.name} - PATCH HTTP status code response for ${logReference}: ${sdkResponse.httpStatusCode}`);
    logger.debug(`${patchPscVerification.name} - PATCH PSC Verification response for ${logReference}: ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse;
};

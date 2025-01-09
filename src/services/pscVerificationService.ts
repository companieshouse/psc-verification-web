import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PscVerification, PscVerificationData, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";

export const createPscVerification = async (request: Request, transaction: Transaction, pscVerification: PscVerificationData): Promise<Resource<PscVerification>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`Creating PSC verification resource for ${transaction.description} transaction ${transaction.id}`);
    const sdkResponse: Resource<PscVerification> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.postPscVerification(transaction.id as string, pscVerification);

    if (!sdkResponse) {
        throw createAndLogError(`${createPscVerification.name} - PSC Verification POST request returned no response for transaction ${transaction.id}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Created) {
        throw createAndLogError(`${createPscVerification.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to POST PSC Verification for transaction ${transaction.id}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`${createPscVerification.name} - PSC Verification API POST request returned no resource for transaction ${transaction.id}`);
    }
    logger.debug(`${createPscVerification.name} - POST PSC Verification response: ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse;
};

export const getPscVerification = async (request: Request, transactionId: string, pscVerificationId: string): Promise<Resource<PscVerification>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transaction ${transactionId}, pscVerification ${pscVerificationId}`;

    logger.debug(`Retrieving PSC verification for ${logReference}`);
    const sdkResponse: Resource<PscVerification> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.getPscVerification(transactionId, pscVerificationId);

    if (!sdkResponse) {
        throw createAndLogError(`${getPscVerification.name} - PSC Verification GET request returned no response for ${logReference}`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getPscVerification.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to GET PSC Verification for ${logReference}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`${getPscVerification.name} - PSC Verification API GET request returned no resource for ${logReference}`);
    }
    logger.debug(`${getPscVerification.name} - GET PSC Verification response: ${sdkResponse.httpStatusCode}`);

    return castedSdkResponse;
};

export const patchPscVerification = async (request: Request, transactionId: string, pscVerificationId: string, pscVerification: PscVerificationData): Promise<Resource<PscVerification>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transactionId ${transactionId}, pscVerificationId ${pscVerificationId}`;

    logger.debug(`Patching PSC verification resource with ${logReference}`);
    const sdkResponse: Resource<PscVerification> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.patchPscVerification(transactionId, pscVerificationId, pscVerification);

    if (!sdkResponse) {
        throw createAndLogError(`${patchPscVerification.name} - PSC Verification PATCH request returned no response for resource with ${logReference}`);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getPscVerification.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to GET PSC Verification validation status for ${logReference}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`PSC Verification API POST request returned no resource with ${logReference}`);
    }
    logger.debug(`${patchPscVerification.name} - PATCH HTTP status code response for ${logReference}: ${sdkResponse.httpStatusCode}`);
    logger.debug(`${patchPscVerification.name} - PATCH PSC Verification response for ${logReference}: ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse;
};

export const getValidationStatus = async (request: Request, transactionId: string, pscVerificationId: string): Promise<Resource<ValidationStatusResponse> | ApiErrorResponse> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transaction ${transactionId}, pscVerification ${pscVerificationId}`;

    logger.debug(`Retrieving PSC verification validation status for ${logReference}`);
    const sdkResponse: Resource<ValidationStatusResponse> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.getValidationStatus(transactionId, pscVerificationId);

    if (!sdkResponse) {
        throw createAndLogError(`${getValidationStatus.name} - PSC Verification GET validation status request did not return a response for ${logReference}`);
    }

    if (sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getValidationStatus.name} - HTTP status response code is not valid: ${sdkResponse.httpStatusCode} - Failed to GET PSC Verification validation status for ${logReference}`);
    }

    const validationStatus = sdkResponse as Resource<ValidationStatusResponse>;

    if (validationStatus.resource?.isValid === false) {
        logger.error(`Validation errors for resource ${logReference}: ` + JSON.stringify(validationStatus.resource.errors.slice(0, 10)));
    } else if (validationStatus.resource?.isValid === undefined) {
        throw createAndLogError(`${getValidationStatus.name} - Error retrieving the validation status for ${logReference}`);
    }

    return validationStatus;
};

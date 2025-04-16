import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PlannedMaintenance, PscVerification, PscVerificationData, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createApiKeyClient, createOAuthApiClient } from "./apiClientService";
import { Responses } from "../constants";

export const createPscVerification = async (request: Request, transaction: Transaction, pscVerification: PscVerificationData): Promise<Resource<PscVerification> | ApiErrorResponse> => {
    if (pscVerification.pscNotificationId == null) {
        throw createAndLogError(`${createPscVerification.name} - Aborting: pscNotificationId is required for PSC Verification POST request for transaction ${transaction.id}. Has the user tried to resume a journey after signing out and in again?`);
    }

    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`Creating PSC verification resource for ${transaction.description} transaction ${transaction.id}`);
    const sdkResponse: Resource<PscVerification> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.postPscVerification(transaction.id as string, pscVerification);

    if (!sdkResponse) {
        throw createAndLogError(`${createPscVerification.name} - PSC Verification POST request returned no response for transaction ${transaction.id}`);
    }

    if (sdkResponse.httpStatusCode === HttpStatusCode.InternalServerError) {
        const error = ((sdkResponse as ApiErrorResponse).errors?.[0] as ApiErrorResponse).errors?.[0].errorValues?.error as string;

        if (RegExp(Responses.PROBLEM_WITH_PSC_DATA as string).exec(error)) {
            return sdkResponse;
        }
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
        throw createAndLogError(`${patchPscVerification.name} - Http status code ${sdkResponse.httpStatusCode} - Failed to PATCH PSC Verification for resource with ${logReference}`);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw createAndLogError(`PSC Verification API PATCH request returned no resource with ${logReference}`);
    }
    logger.debug(`${patchPscVerification.name} - PATCH HTTP status code response for ${logReference}: ${sdkResponse.httpStatusCode}`);
    logger.debug(`${patchPscVerification.name} - PATCH PSC Verification response for ${logReference}: ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse;
};

export const checkPlannedMaintenance = async (request: Request): Promise<ApiResponse<PlannedMaintenance>> => {
    const apiClient: ApiClient = createApiKeyClient();

    logger.debug(`Checking Planned Maintenance for PSC Verification API service`);
    const sdkResponse: ApiResponse<PlannedMaintenance> | ApiErrorResponse = await apiClient.pscVerificationService.checkPlannedMaintenance();

    if (!sdkResponse) {
        throw createAndLogError(`${checkPlannedMaintenance.name} - PSC Verification GET maintenance request returned no response`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${checkPlannedMaintenance.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to GET Planned Maintenance response`);
    }

    const castedSdkResponse = sdkResponse as ApiResponse<PlannedMaintenance>;

    if (!castedSdkResponse) {
        throw createAndLogError(`${checkPlannedMaintenance.name} - PSC Verification API GET request returned no response`);
    }
    logger.debug(`${checkPlannedMaintenance.name} - GET PSC Verification Planned Maintenance response: ${sdkResponse.httpStatusCode}`);

    return castedSdkResponse;
};

export const getValidationStatus = async (request: Request, transactionId: string, pscVerificationId: string): Promise<Resource<ValidationStatusResponse>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transaction ${transactionId}, pscVerification ${pscVerificationId}`;

    logger.debug(`Retrieving PSC verification validation status for ${logReference}`);
    const sdkResponse: Resource<ValidationStatusResponse> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.getValidationStatus(transactionId, pscVerificationId);

    if (!sdkResponse) {
        throw createAndLogError(`${getValidationStatus.name} - PSC Verification GET validation status request did not return a response for ${logReference}`);
    }

    if (sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getValidationStatus.name} - Error getting validation status: HTTP response is: ${sdkResponse.httpStatusCode} for ${logReference}`);
    }

    const validationStatus = sdkResponse as Resource<ValidationStatusResponse>;

    if (validationStatus.resource?.isValid === false) {
        logger.error(`Validation errors for resource ${logReference}: ` + JSON.stringify(validationStatus.resource.errors.slice(0, 10)));
    } else if (validationStatus.resource?.isValid === undefined) {
        throw createAndLogError(`${getValidationStatus.name} - Error getting validation status for ${logReference}`);
    }

    return validationStatus;
};

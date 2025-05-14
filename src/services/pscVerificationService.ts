import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PlannedMaintenance, PscVerification, PscVerificationData, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { logger } from "../lib/logger";
import { HttpError } from "../lib/errors/httpError";
import { createApiKeyClient, createOAuthApiClient } from "./apiClientService";
import { Responses } from "../constants";
import { DataIntegrityError, DataIntegrityErrorType } from "../lib/errors/dataIntegrityError";

export const createPscVerification = async (request: Request, transaction: Transaction, pscVerification: PscVerificationData): Promise<Resource<PscVerification> | ApiErrorResponse> => {
    if (!pscVerification) {
        throw new Error(`${createPscVerification.name} - Aborting: PscVerificationData is required for PSC Verification POST request for transaction ${transaction.id}`);
    }
    if (!pscVerification.companyNumber) {
        throw new Error(`${createPscVerification.name} - Aborting: companyNumber is required for PSC Verification POST request for transaction ${transaction.id}.`);
    }
    if (pscVerification.pscNotificationId == null) {
        throw new DataIntegrityError(`${createPscVerification.name} - Aborting: pscNotificationId is required for PSC Verification POST request for transaction ${transaction.id}.`, DataIntegrityErrorType.PSC_DATA);
    }

    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`Creating PSC verification resource for ${transaction.description} transaction ${transaction.id}`);
    const sdkResponse: Resource<PscVerification> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.postPscVerification(transaction.id as string, pscVerification);

    if (!sdkResponse) {
        throw new Error(`${createPscVerification.name} - PSC Verification POST request returned no response for transaction ${transaction.id}`);
    }

    if (sdkResponse.httpStatusCode === HttpStatusCode.InternalServerError) {
        const error = ((sdkResponse as ApiErrorResponse).errors?.[0] as ApiErrorResponse).errors?.[0].errorValues?.error as string;

        if (RegExp(Responses.PROBLEM_WITH_PSC_DATA as string).exec(error)) {
            throw new DataIntegrityError(`${createPscVerification.name} - ${Responses.PROBLEM_WITH_PSC_DATA} - Failed to POST PSC Verification for transaction ${transaction.id}`, DataIntegrityErrorType.PSC_DATA);
        }
    }

    if (!sdkResponse.httpStatusCode) {
        throw new Error(`${createPscVerification.name} - HTTP status code is undefined - Failed to POST PSC Verification for transaction ${transaction.id}`);
    } else if (sdkResponse.httpStatusCode === HttpStatusCode.BadRequest || sdkResponse.httpStatusCode === HttpStatusCode.NotFound) {
        const message = (sdkResponse as any)?.resource?.errors?.[0]?.error ?? `Failed to POST PSC Verification for transaction ${transaction.id}`;
        throw new DataIntegrityError(`${createPscVerification.name} received ${sdkResponse.httpStatusCode} - ${message}`, DataIntegrityErrorType.PSC_DATA);
    } else if (sdkResponse.httpStatusCode !== HttpStatusCode.Created) {
        throw new HttpError(`${createPscVerification.name} - Failed to POST PSC Verification for transaction ${transaction.id}`, sdkResponse.httpStatusCode);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw new Error(`${createPscVerification.name} - PSC Verification API POST request returned no resource for transaction ${transaction.id}`);
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
        throw new Error(`${getPscVerification.name} - PSC Verification GET request returned no response for ${logReference}`);
    }
    switch (sdkResponse.httpStatusCode) {
        case HttpStatusCode.Ok:
            break; // Successful response, proceed further
        case HttpStatusCode.Unauthorized:
            // Show the Page Not Found page if the user is not authorized to view the resource
            throw new HttpError(`${getPscVerification.name} - User not authorized owner for ${logReference}`, HttpStatusCode.NotFound);

        case undefined:
            throw new Error(`${getPscVerification.name} - HTTP status code is undefined - Failed to GET PSC Verification for ${logReference}`);
        default:
            throw new HttpError(`${getPscVerification.name} - Failed to GET PSC Verification for ${logReference}`, sdkResponse.httpStatusCode);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw new Error(`${getPscVerification.name} - PSC Verification API GET request returned no resource for ${logReference}`);
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
        throw new Error(`${patchPscVerification.name} - PSC Verification PATCH request returned no response for resource with ${logReference}`);
    }

    if (!sdkResponse.httpStatusCode) {
        throw new Error(`${patchPscVerification.name} - HTTP status code is undefined - Failed to PATCH PSC Verification for resource with ${logReference}`);
    } else if (sdkResponse.httpStatusCode === HttpStatusCode.BadRequest || sdkResponse.httpStatusCode === HttpStatusCode.NotFound) {
        const message = (sdkResponse as any)?.resource?.errors?.[0]?.error ?? `Failed to PATCH PSC Verification for resource with ${logReference}`;
        throw new DataIntegrityError(`${patchPscVerification.name} received ${sdkResponse.httpStatusCode} - ${message}`, DataIntegrityErrorType.PSC_DATA);
    } else if (sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw new HttpError(`${patchPscVerification.name} - Failed to PATCH PSC Verification for resource with ${logReference}`, sdkResponse.httpStatusCode);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw new Error(`PSC Verification API PATCH request returned no resource with ${logReference}`);
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
        throw new Error(`${checkPlannedMaintenance.name} - PSC Verification GET maintenance request returned no response`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw new Error(`${checkPlannedMaintenance.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to GET Planned Maintenance response`);
    }

    const castedSdkResponse = sdkResponse as ApiResponse<PlannedMaintenance>;
    logger.debug(`${checkPlannedMaintenance.name} - GET PSC Verification Planned Maintenance response: ${sdkResponse.httpStatusCode}`);

    return castedSdkResponse;
};

export const getValidationStatus = async (request: Request, transactionId: string, pscVerificationId: string): Promise<Resource<ValidationStatusResponse>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transaction ${transactionId}, pscVerification ${pscVerificationId}`;

    logger.debug(`Retrieving PSC verification validation status for ${logReference}`);
    const sdkResponse: Resource<ValidationStatusResponse> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.getValidationStatus(transactionId, pscVerificationId);

    if (!sdkResponse) {
        throw new Error(`${getValidationStatus.name} - PSC Verification GET validation status request did not return a response for ${logReference}`);
    }

    if (sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw new Error(`${getValidationStatus.name} - Error getting validation status: HTTP response is: ${sdkResponse.httpStatusCode} for ${logReference}`);
    }

    const validationStatus = sdkResponse as Resource<ValidationStatusResponse>;

    if (validationStatus.resource?.isValid === false) {
        logger.error(`Validation errors for resource ${logReference}: ` + JSON.stringify(validationStatus.resource.errors.slice(0, 10)));
    } else if (validationStatus.resource?.isValid === undefined) {
        throw new Error(`${getValidationStatus.name} - Error getting validation status for ${logReference}`);
    }

    return validationStatus;
};

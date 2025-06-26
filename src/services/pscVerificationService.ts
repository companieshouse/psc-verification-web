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
        throw new Error(`Aborting: PscVerificationData is required for PSC Verification POST request for transactionId="${transaction.id}"`);
    }
    if (!pscVerification.companyNumber) {
        throw new Error(`Aborting: companyNumber is required for PSC Verification POST request for transactionId="${transaction.id}"`);
    }
    if (pscVerification.pscNotificationId == null) {
        throw new DataIntegrityError(`Aborting: pscNotificationId is required for PSC Verification POST request for transactionId="${transaction.id}"`, DataIntegrityErrorType.PSC_DATA);
    }

    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`Creating PSC verification resource for transactionId="${transaction.id}": ${transaction.description}`);
    const sdkResponse: Resource<PscVerification> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.postPscVerification(transaction.id as string, pscVerification);

    if (!sdkResponse) {
        throw new Error(`PSC Verification POST request returned no response for transactionId="${transaction.id}"`);
    }

    if (sdkResponse.httpStatusCode === HttpStatusCode.InternalServerError) {
        const error = ((sdkResponse as ApiErrorResponse).errors?.[0] as ApiErrorResponse).errors?.[0].errorValues?.error as string;

        if (RegExp(Responses.PROBLEM_WITH_PSC_DATA as string).exec(error)) {
            throw new DataIntegrityError(`${Responses.PROBLEM_WITH_PSC_DATA} - Failed to POST PSC Verification for transactionId="${transaction.id}"`, DataIntegrityErrorType.PSC_DATA);
        }
    }

    if (!sdkResponse.httpStatusCode) {
        throw new Error(`HTTP status code is undefined - Failed to POST PSC Verification for transactionId="${transaction.id}"`);
    } else if (sdkResponse.httpStatusCode === HttpStatusCode.BadRequest || sdkResponse.httpStatusCode === HttpStatusCode.NotFound) {
        const message = (sdkResponse as any)?.resource?.errors?.[0]?.error ?? `Failed to POST PSC Verification for transactionId="${transaction.id}"`;
        throw new DataIntegrityError(`received ${sdkResponse.httpStatusCode} - ${message}`, DataIntegrityErrorType.PSC_DATA);
    } else if (sdkResponse.httpStatusCode !== HttpStatusCode.Created) {
        throw new HttpError(`Failed to POST PSC Verification for transactionId="${transaction.id}"`, sdkResponse.httpStatusCode);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw new Error(`PSC Verification API POST request returned no resource for transactionId="${transaction.id}"`);
    }
    logger.debug(`POST PSC Verification finished with status ${sdkResponse.httpStatusCode} for transactionId="${transaction.id}"`);

    return castedSdkResponse;
};

export const getPscVerification = async (request: Request, transactionId: string, pscVerificationId: string): Promise<Resource<PscVerification>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transactionId="${transactionId}", pscVerificationId="${pscVerificationId}"`;

    logger.debug(`Retrieving PSC verification for ${logReference}`);
    const sdkResponse: Resource<PscVerification> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.getPscVerification(transactionId, pscVerificationId);

    if (!sdkResponse) {
        throw new Error(`PSC Verification GET request returned no response for ${logReference}`);
    }
    switch (sdkResponse.httpStatusCode) {
        case HttpStatusCode.Ok:
            break; // Successful response, proceed further
        case HttpStatusCode.Unauthorized:
            // Show the Page Not Found page if the user is not authorized to view the resource
            throw new HttpError(`User not authorized owner for ${logReference}`, HttpStatusCode.NotFound);

        case undefined:
            throw new Error(`HTTP status code is undefined - Failed to GET PSC Verification for ${logReference}`);
        default:
            throw new HttpError(`Failed to GET PSC Verification for ${logReference}`, sdkResponse.httpStatusCode);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw new Error(`PSC Verification API GET request returned no resource for ${logReference}`);
    }
    logger.debug(`GET PSC Verification finished with status ${sdkResponse.httpStatusCode} for ${logReference}`);

    return castedSdkResponse;
};

export const patchPscVerification = async (request: Request, transactionId: string, pscVerificationId: string, pscVerification: PscVerificationData): Promise<Resource<PscVerification>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transactionId="${transactionId}", pscVerificationId="${pscVerificationId}"`;

    logger.debug(`Patching PSC verification resource with with ${logReference}`);
    const sdkResponse: Resource<PscVerification> | ApiErrorResponse = await oAuthApiClient.pscVerificationService.patchPscVerification(transactionId, pscVerificationId, pscVerification);

    if (!sdkResponse) {
        throw new Error(`PSC Verification PATCH request returned no response for resource with ${logReference}`);
    }

    if (!sdkResponse.httpStatusCode) {
        throw new Error(`HTTP status code is undefined - Failed to PATCH PSC Verification for resource with ${logReference}`);
    } else if (sdkResponse.httpStatusCode === HttpStatusCode.BadRequest || sdkResponse.httpStatusCode === HttpStatusCode.NotFound) {
        const message = (sdkResponse as any)?.resource?.errors?.[0]?.error ?? `Failed to PATCH PSC Verification for resource with ${logReference}`;
        const errorValues = (sdkResponse as any)?.resource?.errors?.[0]?.errorValues ?? {};
        const errorContext = JSON.stringify(errorValues, null, 2);
        throw new DataIntegrityError(`received ${sdkResponse.httpStatusCode} - ${message}, context: \n${errorContext}`, DataIntegrityErrorType.PSC_DATA);
    } else if (sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw new HttpError(`Failed to PATCH PSC Verification for resource with ${logReference}`, sdkResponse.httpStatusCode);
    }

    const castedSdkResponse = sdkResponse as Resource<PscVerification>;

    if (!castedSdkResponse.resource) {
        throw new Error(`PSC Verification API PATCH request returned no resource with ${logReference}`);
    }
    logger.debug(`PATCH PSC verification finished with status ${sdkResponse.httpStatusCode} for ${logReference}`);

    return castedSdkResponse;
};

export const checkPlannedMaintenance = async (request: Request): Promise<ApiResponse<PlannedMaintenance>> => {
    const apiClient: ApiClient = createApiKeyClient();

    logger.debug(`Checking Planned Maintenance for PSC Verification API service`);
    const sdkResponse: ApiResponse<PlannedMaintenance> | ApiErrorResponse = await apiClient.pscVerificationService.checkPlannedMaintenance();

    if (!sdkResponse) {
        throw new Error(`PSC Verification GET maintenance request returned no response`);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw new Error(`HTTP status code ${sdkResponse.httpStatusCode} - Failed to GET Planned Maintenance response`);
    }

    const castedSdkResponse = sdkResponse as ApiResponse<PlannedMaintenance>;
    logger.debug(`GET PSC Verification Planned Maintenance finished with ${sdkResponse.httpStatusCode}`);

    return castedSdkResponse;
};

const fetchValidationStatus = async (
    request: Request,
    transactionId: string,
    pscVerificationId: string
): Promise<Resource<ValidationStatusResponse>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const logReference = `transactionId="${transactionId}", pscVerificationId="${pscVerificationId}"`;

    logger.debug(`Retrieving PSC verification validation status for ${logReference}`);
    const sdkResponse: Resource<ValidationStatusResponse> | ApiErrorResponse =
        await oAuthApiClient.pscVerificationService.getValidationStatus(transactionId, pscVerificationId);

    if (!sdkResponse) {
        throw new Error(`PSC Verification GET validation status request did not return a response for ${logReference}`);
    }

    if (sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw new Error(`Error getting validation status: HTTP response is ${sdkResponse.httpStatusCode} for ${logReference}`);
    }

    const validationStatus = sdkResponse as Resource<ValidationStatusResponse>;

    return validationStatus;
};

export const getValidationStatus = async (
    request: Request,
    transactionId: string,
    pscVerificationId: string
): Promise<Resource<ValidationStatusResponse>> => {
    const validationStatus = await fetchValidationStatus(request, transactionId, pscVerificationId);
    const logReference = `transactionId="${transactionId}", pscVerificationId="${pscVerificationId}"`;

    if (validationStatus.resource?.isValid === false) {
        logger.error(`Validation errors for ${logReference}: ` + JSON.stringify(validationStatus.resource.errors.slice(0, 10)));
    } else if (validationStatus.resource?.isValid === undefined) {
        throw new Error(`Error getting validation status for ${logReference}`);
    }

    return validationStatus;
};

export const getPersonalCodeValidationStatus = async (
    request: Request,
    transactionId: string,
    pscVerificationId: string
): Promise<Resource<ValidationStatusResponse>> => {
    const validationStatus = await fetchValidationStatus(request, transactionId, pscVerificationId);
    const logReference = `transactionId="${transactionId}", pscVerificationId="${pscVerificationId}"`;

    if (!validationStatus.resource) {
        throw new Error(`Error getting validation status for ${logReference}`);
    }

    const filteredErrors = validationStatus.resource.errors.filter(
        (error: { location?: string }) => error.location !== "$.verification_statement"
    );
    validationStatus.resource.errors = filteredErrors;
    if (filteredErrors.length === 0) {
        validationStatus.resource.isValid = true;
    }

    if (validationStatus.resource?.isValid === false) {
        logger.error(`Validation errors for ${logReference}: ` + JSON.stringify(validationStatus.resource.errors.slice(0, 10)));
    } else if (validationStatus.resource?.isValid === undefined) {
        throw new Error(`Error getting validation status for ${logReference}`);
    }

    return validationStatus;
};

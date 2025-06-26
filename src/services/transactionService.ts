import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { HttpError } from "../lib/errors/httpError";
import { logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";
import { getCompanyProfile } from "./companyProfileService";

export const REFERENCE = "PscVerificationReference";
export const DESCRIPTION = "PSC Verification Transaction";
export enum TransactionStatus { OPEN = "open", CLOSED = "closed" }

export const getTransaction = async (req: Request, transactionId: string): Promise<Transaction> => {
    const apiClient: ApiClient = createOAuthApiClient(req.session);

    logger.debug(`Retrieving transaction with transactionId="${transactionId}"`);
    const sdkResponse: Resource<Transaction> | ApiErrorResponse = await apiClient.transaction.getTransaction(transactionId);

    if (!sdkResponse) {
        logger.error(`Transaction API GET request returned no response for transactionId="${transactionId}"`);
        return Promise.reject(new Error(`No response from Transaction API for transactionId="${transactionId}"`));
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= HttpStatusCode.BadRequest) {
        logger.error(`HTTP status code ${sdkResponse.httpStatusCode} - Failed to get transaction with transactionId="${transactionId}"`);
        return Promise.reject(new HttpError(`Failed to get transaction with transactionId="${transactionId}"`, sdkResponse.httpStatusCode ?? HttpStatusCode.InternalServerError));
    }

    const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

    if (!castedSdkResponse.resource) {
        logger.error(`Transaction API GET request returned no resource for transactionId="${transactionId}"`);
        return Promise.reject(new Error(`No resource in Transaction API response for transactionId="${transactionId}"`));
    }

    logger.debug(`Retrieved transaction with status code ${sdkResponse.httpStatusCode} for transactionId="${transactionId}"`);

    return Promise.resolve(castedSdkResponse.resource);
};

export const postTransaction = async (req: Request): Promise<Transaction> => {
    const companyNumber = req.query.companyNumber as string;
    const companyProfile: CompanyProfile = await getCompanyProfile(req, companyNumber);
    const companyName: string = companyProfile.companyName;
    const oAuthApiClient = createOAuthApiClient(req.session);

    const transaction: Transaction = {
        reference: REFERENCE,
        description: DESCRIPTION,
        companyName
    };

    logger.debug(`Creating transaction with companyNumber="${companyNumber}"`);
    const sdkResponse: Resource<Transaction> | ApiErrorResponse = await oAuthApiClient.transaction.postTransaction(transaction);

    if (!sdkResponse) {
        logger.error(`Transaction API POST request returned no response for companyNumber="${companyNumber}"`);
        return Promise.reject(sdkResponse);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= HttpStatusCode.BadRequest) {
        logger.error(`HTTP status code ${sdkResponse.httpStatusCode} - Failed to post transaction with companyNumber="${companyNumber}"`);
        return Promise.reject(sdkResponse);
    }

    const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

    if (!castedSdkResponse.resource) {
        logger.error(`Transaction API POST request returned no resource for companyNumber="${companyNumber}"`);
        return Promise.reject(sdkResponse);
    }

    logger.debug(`Received transaction with status code ${sdkResponse.httpStatusCode} for companyNumber="${companyNumber}"`);

    return Promise.resolve(castedSdkResponse.resource);
};

export const putTransaction = async (req: Request, transactionId: string, description: string, transactionStatus: string, objectId: string | undefined): Promise<ApiResponse<Transaction>> => {
    const apiClient: ApiClient = createOAuthApiClient(req.session);

    const transaction: Transaction = {
        description,
        id: transactionId,
        reference: [REFERENCE, objectId].join("_"),
        status: transactionStatus
    };

    logger.debug(`Updating transaction with transactionId="${transactionId}", status="${transactionStatus}"`);
    const sdkResponse: ApiResponse<Transaction> | ApiErrorResponse = await apiClient.transaction.putTransaction(transaction);

    if (!sdkResponse) {
        logger.error(`Transaction API PUT request returned no response for transactionId="${transactionId}"`);
        return Promise.reject(sdkResponse);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.NoContent) {
        logger.error(`HTTP status code ${sdkResponse.httpStatusCode} - Failed to put transaction with transactionId="${transactionId}"`);
        return Promise.reject(sdkResponse);
    }

    const castedSdkResponse: ApiResponse<Transaction> = sdkResponse as ApiResponse<Transaction>;

    logger.debug(`Updated transaction with transactionId="${transactionId}"`);

    return Promise.resolve(castedSdkResponse);
};

export const closeTransaction = async (req: Request, transactionId: string, objectId: string | undefined): Promise<Resource<Transaction> | ApiErrorResponse> => {
    logger.debug(`Closing transaction with transactionId="${transactionId}", updating reference`);

    const putResponse: ApiResponse<Transaction> = await putTransaction(req, transactionId, DESCRIPTION, TransactionStatus.CLOSED, objectId)
        .catch((sdkResponse) => {
            logger.error(`Failed to close transaction with transactionId="${transactionId}"`);
            return Promise.reject(sdkResponse);
        });

    logger.debug(`Closed transaction with transactionId="${transactionId}"`);

    return Promise.resolve(putResponse);
};

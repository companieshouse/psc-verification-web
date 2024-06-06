import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";

export const REFERENCE = "PscVerificationReference";
export const DESCRIPTION = "PSC Verification Transaction";
export enum TransactionStatus { OPEN = "open", CLOSED = "closed" }

export const postTransaction = async (req: Request): Promise<Transaction> => {

    const companyNumber = req.query.companyNumber as string;
    const oAuthApiClient = createOAuthApiClient(req.session);

    const transaction: Transaction = {
        reference: REFERENCE,
        description: DESCRIPTION
    };

    logger.debug(`Creating transaction with company number ${companyNumber}`);
    const sdkResponse: Resource<Transaction> | ApiErrorResponse = await oAuthApiClient.transaction.postTransaction(transaction);

    if (!sdkResponse) {
        logger.error(`Transaction API POST request returned no response for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
        logger.error(`HTTP status code ${sdkResponse.httpStatusCode} - Failed to post transaction for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }

    const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

    if (!castedSdkResponse.resource) {
        logger.error(`Transaction API POST request returned no resource for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }
    logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

    return Promise.resolve(castedSdkResponse.resource);
};

export const putTransaction = async (req: Request,
    transactionId: string,
    description: string,
    transactionStatus: string,
    objectId: string|undefined): Promise<ApiResponse<Transaction>> => {
    const apiClient: ApiClient = createOAuthApiClient(req.session);

    const transaction: Transaction = {
        description,
        id: transactionId,
        reference: [REFERENCE, objectId].join("_"),
        status: transactionStatus
    };

    logger.debug(`Updating transaction id ${transactionId} with status ${transactionStatus}`);
    const sdkResponse: ApiResponse<Transaction> | ApiErrorResponse = await apiClient.transaction.putTransaction(transaction);

    if (!sdkResponse) {
        logger.error(`Transaction API PUT request returned no response for transaction id ${transactionId}`);
        return Promise.reject(sdkResponse);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== StatusCodes.NO_CONTENT) {
        logger.error(`HTTP status code ${sdkResponse.httpStatusCode} - Failed to put transaction for transaction id ${transactionId}`);
        return Promise.reject(sdkResponse);
    }

    const castedSdkResponse: ApiResponse<Transaction> = sdkResponse as ApiResponse<Transaction>;

    logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

    return Promise.resolve(castedSdkResponse);
};

export const closeTransaction = async (req: Request, transactionId: string, objectId: string|undefined): Promise<Resource<Transaction> | ApiErrorResponse> => {
    logger.debug(`Closing transaction id ${transactionId}, updating reference`);

    const putResponse: ApiResponse<Transaction> = await putTransaction(req, transactionId, DESCRIPTION, TransactionStatus.CLOSED, objectId)
        .catch((sdkResponse) => {
            return Promise.reject(sdkResponse);
        });
    logger.debug(`Closed transaction ${JSON.stringify(putResponse)}`);

    return Promise.resolve(putResponse);

};

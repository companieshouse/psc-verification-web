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

    logger.debug(`${getTransaction.name} - Retrieving transaction with id ${transactionId}`);
    const sdkResponse: Resource<Transaction> | ApiErrorResponse = await apiClient.transaction.getTransaction(transactionId);

    if (!sdkResponse) {
        logger.error(`${getTransaction.name} - Transaction API GET request returned no response for transaction id ${transactionId}`);
        return Promise.reject(new Error("No response from Transaction API"));
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= HttpStatusCode.BadRequest) {
        logger.error(`${getTransaction.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to get transaction for transaction id ${transactionId}`);
        return Promise.reject(new HttpError(`Failed to get transaction`, sdkResponse.httpStatusCode ?? HttpStatusCode.InternalServerError));
    }

    const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

    if (!castedSdkResponse.resource) {
        logger.error(`${getTransaction.name} - Transaction API GET request returned no resource for transaction id ${transactionId}`);
        return Promise.reject(new Error("No resource in Transaction API response"));
    }

    logger.debug(`${getTransaction.name} - Retrieved transaction: ${JSON.stringify(castedSdkResponse.resource)}`);

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
        companyName: companyName
    };

    logger.debug(`${postTransaction.name} - Creating transaction with company number ${companyNumber}`);
    const sdkResponse: Resource<Transaction> | ApiErrorResponse = await oAuthApiClient.transaction.postTransaction(transaction);

    if (!sdkResponse) {
        logger.error(`${postTransaction.name} - Transaction API POST request returned no response for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }
    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= HttpStatusCode.BadRequest) {
        logger.error(`${postTransaction.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to post transaction for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }

    const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

    if (!castedSdkResponse.resource) {
        logger.error(`${postTransaction.name} - Transaction API POST request returned no resource for company number ${companyNumber}`);
        return Promise.reject(sdkResponse);
    }
    logger.debug(`${postTransaction.name} - Received transaction: ${JSON.stringify(sdkResponse)}`);

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

    logger.debug(`${putTransaction.name} - Updating transaction id ${transactionId} with status ${transactionStatus}`);
    const sdkResponse: ApiResponse<Transaction> | ApiErrorResponse = await apiClient.transaction.putTransaction(transaction);

    if (!sdkResponse) {
        logger.error(`${putTransaction.name} - Transaction API PUT request returned no response for transaction id ${transactionId}`);
        return Promise.reject(sdkResponse);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.NoContent) {
        logger.error(`${putTransaction.name} - HTTP status code ${sdkResponse.httpStatusCode} - Failed to put transaction for transaction id ${transactionId}`);
        return Promise.reject(sdkResponse);
    }

    const castedSdkResponse: ApiResponse<Transaction> = sdkResponse as ApiResponse<Transaction>;

    logger.debug(`${putTransaction.name} - Received transaction: ${JSON.stringify(sdkResponse)}`);

    return Promise.resolve(castedSdkResponse);
};

export const closeTransaction = async (req: Request, transactionId: string, objectId: string|undefined): Promise<Resource<Transaction> | ApiErrorResponse> => {
    logger.debug(`${closeTransaction.name} - Closing transaction id ${transactionId}, updating reference`);

    const putResponse: ApiResponse<Transaction> = await putTransaction(req, transactionId, DESCRIPTION, TransactionStatus.CLOSED, objectId)
        .catch((sdkResponse) => {
            return Promise.reject(sdkResponse);
        });
    logger.debug(`${closeTransaction.name} - Closed transaction: ${JSON.stringify(putResponse)}`);

    return Promise.resolve(putResponse);

};

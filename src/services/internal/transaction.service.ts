import logger from "../../lib/Logger";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { env } from "../../config";

export const postTransaction = async (companyNumber: string, description: string, reference: string): Promise<Transaction> => {
    const apiClient = createApiClient(env.CHS_API_KEY, undefined, env.API_URL);

    const transaction: Transaction = {
        companyNumber,
        reference,
        description
    };

    logger.debug(`Creating transaction with company number ${companyNumber}`);
    const sdkResponse: Resource<Transaction> | ApiErrorResponse = await apiClient.transaction.postTransaction(transaction);

    if (!sdkResponse) {
        throw logger.error(`Transaction API POST request returned no response for company number ${companyNumber}`);
    }

    if (!sdkResponse.httpStatusCode || sdkResponse.httpStatusCode >= 400) {
        throw logger.error(`Http status code ${sdkResponse.httpStatusCode} - Failed to post transaction for company number ${companyNumber}`);
    }

    const castedSdkResponse: Resource<Transaction> = sdkResponse as Resource<Transaction>;

    if (!castedSdkResponse.resource) {
        throw logger.error(`Transaction API POST request returned no resource for company number ${companyNumber}`);
    }

    logger.debug(`Received transaction ${JSON.stringify(sdkResponse)}`);

    return castedSdkResponse.resource;
};

import logger from "../../lib/Logger";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { createApiClient, Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { getAccessToken } from "../../utils/session";

export const postTransaction = async (req: Request): Promise<Transaction> => {

    const session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const reference = "PscVerificationReference";
    const description = "PSC Verification Transaction";

    const accessToken: string = getAccessToken(session);
    const apiClient = createApiClient(undefined, accessToken, undefined);

    const transaction: Transaction = {
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

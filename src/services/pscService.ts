import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PersonWithSignificantControl, PscVerificationState } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";

export const getPscIndividual = async (request: Request, companyNumber: string, pscId: string): Promise<Resource<PersonWithSignificantControl>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`${getPscIndividual.name} - for PSC ID: ${pscId}`);
    const sdkResponse: Resource<PersonWithSignificantControl> | ApiErrorResponse = await oAuthApiClient.pscService.getPscIndividual(companyNumber, pscId);

    if (!sdkResponse || !sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getPscIndividual.name} - Failed to get details for PSC Id  ${pscId}`);
    }

    logger.debug(`${getPscIndividual.name} - response: ${JSON.stringify(sdkResponse)}`);
    const PscSdkResponse = sdkResponse as Resource<PersonWithSignificantControl>;

    if (!PscSdkResponse.resource) {
        throw createAndLogError(`${getPscIndividual.name} - no resource returned for PSC Id ${pscId}`);
    }

    return PscSdkResponse;
};

export const getPscVerificationState = async (request: Request, pscNotificationId: string): Promise<Resource<PscVerificationState>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`${getPscVerificationState.name} - for PSC notification ID: ${pscNotificationId}`);
    const sdkResponse: Resource<PscVerificationState> | ApiErrorResponse = await oAuthApiClient.pscService.getPscVerificationState(pscNotificationId);

    if (!sdkResponse || !sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getPscVerificationState.name} - Failed to get verification status for PSC notification ID: ${pscNotificationId}`);
    }

    logger.debug(`${getPscVerificationState.name} - response: ${JSON.stringify(sdkResponse)}`);
    const PscSdkResponse = sdkResponse as Resource<PscVerificationState>;

    if (!PscSdkResponse.resource) {
        throw createAndLogError(`${getPscVerificationState.name} - no resource returned for PSC notification ID: ${pscNotificationId}`);
    }

    return PscSdkResponse;
};

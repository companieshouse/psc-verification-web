import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";

export const getPscIndividual = async (request: Request, companyNumber: string, pscId: string): Promise<Resource<PersonWithSignificantControl>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`getPscIndividual for PSC Id ${pscId}`);
    const sdkResponse: Resource<PersonWithSignificantControl> | ApiErrorResponse = await oAuthApiClient.pscService.getPscIndividual(companyNumber, pscId);

    if (!sdkResponse || !sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`getPscIndividual - Failed to get details for PSC Id  ${pscId}`);
    }

    logger.debug(`getPscIndividual response PSC ${JSON.stringify(sdkResponse)}`);
    const PscSdkResponse = sdkResponse as Resource<PersonWithSignificantControl>;

    if (!PscSdkResponse.resource) {
        throw createAndLogError(`getPscIndividual returned no resource for PSC Id ${pscId}`);
    }

    return PscSdkResponse;
};

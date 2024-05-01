import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyPersonWithSignificantControlResource, CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";

export const getCompanyIndividualPscList = async (request: Request): Promise<CompanyPersonWithSignificantControlResource[]> => {
    const companyNumber = request.query.companyNumber as string;

    const response = await getCompanyPscList(request);

    const companyPscsResource = response.resource as CompanyPersonsWithSignificantControlResource;

    if (companyPscsResource === null || companyPscsResource.items === null) {
        logger.info(`getCompanyIndividualPscList no pscs have been found for company ${companyNumber}`);
        return [];
    }

    const companyPscList = companyPscsResource.items as CompanyPersonWithSignificantControlResource[];
    const filteredResult = companyPscList.filter((psc) => {
        return psc.kind === "individual-person-with-significant-control" && (psc.ceased_on === null || psc.ceased_on === undefined);
    });

    return filteredResult;
};

export const getCompanyPscList = async (request: Request): Promise<Resource<CompanyPersonsWithSignificantControlResource>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);
    const companyNumber = request.query.companyNumber as string;

    logger.debug(`getCompanyPscList for company number ${companyNumber}`);
    const sdkResponse: Resource<CompanyPersonsWithSignificantControlResource> | ApiErrorResponse = await oAuthApiClient.companyPsc.getCompanyPsc(companyNumber);

    if (!sdkResponse || !sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`Http status code ${sdkResponse.httpStatusCode} - Failed to get company psc list for company number ${companyNumber}`);
    }

    logger.debug(`Received company psc list ${JSON.stringify(sdkResponse)}`);
    const companyPscsSdkResponse = sdkResponse as Resource<CompanyPersonsWithSignificantControlResource>;

    if (!companyPscsSdkResponse.resource) {
        throw createAndLogError(`getCompanyPscList returned no resource for company number ${companyNumber}`);
    }

    return companyPscsSdkResponse;
};

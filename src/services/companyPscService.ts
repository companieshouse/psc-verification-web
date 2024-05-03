import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyPersonWithSignificantControlResource, CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";

export const getCompanyIndividualPscList = async (request: Request, companyNumber: string): Promise<CompanyPersonWithSignificantControlResource[]> => {
    const IND_PSC_TYPE = "individual-person-with-significant-control";
    const response = await getCompanyPscList(request, companyNumber);
    const companyPscsResource = response.resource as CompanyPersonsWithSignificantControlResource;

    if (companyPscsResource === null || companyPscsResource.items === null) {
        logger.info(`getCompanyIndividualPscList no pscs have been found for company ${companyNumber}`);
        return [];
    }

    const companyPscList = companyPscsResource.items as CompanyPersonWithSignificantControlResource[];

    const individualPscList = companyPscList.filter((psc) => {
        return psc.kind === IND_PSC_TYPE && (psc.ceased_on === null || psc.ceased_on === undefined);
    });

    return individualPscList;
};

export const getCompanyPscList = async (request: Request, companyNumber: string): Promise<Resource<CompanyPersonsWithSignificantControlResource>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`getCompanyPscList for company number ${companyNumber}`);
    const sdkResponse: Resource<CompanyPersonsWithSignificantControlResource> | ApiErrorResponse = await oAuthApiClient.companyPsc.getCompanyPsc(companyNumber);

    if (!sdkResponse || !sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`getCompanyPscList - Failed to get company psc list for company number ${companyNumber}`);
    }

    logger.debug(`getCompanyPscList getCompanyPsc response company psc list ${JSON.stringify(sdkResponse)}`);
    const companyPscsSdkResponse = sdkResponse as Resource<CompanyPersonsWithSignificantControlResource>;

    if (!companyPscsSdkResponse.resource) {
        throw createAndLogError(`getCompanyPscList returned no resource for company number ${companyNumber}`);
    }

    return companyPscsSdkResponse;
};

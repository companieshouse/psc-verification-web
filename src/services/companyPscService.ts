import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyPersonWithSignificantControl, CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";

export const getCompanyIndividualPscList = async (request: Request, companyNumber: string): Promise<CompanyPersonWithSignificantControl[]> => {
    const IND_PSC_TYPE = "individual-person-with-significant-control";
    const response = await getCompanyPscList(request, companyNumber);
    const companyPscs = response.resource as CompanyPersonsWithSignificantControl;

    if (companyPscs === null || companyPscs.items === null) {
        logger.info(`${getCompanyIndividualPscList.name} - no pscs have been found for company ${companyNumber}`);

        return [];
    }

    const companyPscList = companyPscs.items;

    return companyPscList.filter((psc) => {
        return psc.kind === IND_PSC_TYPE && (psc.ceasedOn === null || psc.ceasedOn === undefined);
    });
};

export const getCompanyPscList = async (request: Request, companyNumber: string): Promise<Resource<CompanyPersonsWithSignificantControl>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`${getCompanyPscList.name} for company number ${companyNumber}`);
    const sdkResponse: Resource<CompanyPersonsWithSignificantControl> | ApiErrorResponse = await oAuthApiClient.companyPsc.getCompanyPsc(companyNumber);

    if (!sdkResponse || !sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
        throw createAndLogError(`${getCompanyPscList.name} - Failed to get company psc list for company number ${companyNumber}`);
    }

    logger.debug(`${getCompanyPscList.name} - company psc list response for company number ${companyNumber}:  ${JSON.stringify(sdkResponse)}`);
    const companyPscsSdkResponse = sdkResponse as Resource<CompanyPersonsWithSignificantControl>;

    if (!companyPscsSdkResponse.resource) {
        throw createAndLogError(`${getCompanyPscList.name} returned no resource for company number ${companyNumber}`);
    }

    return companyPscsSdkResponse;
};

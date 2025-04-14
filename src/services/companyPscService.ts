import { Resource } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { CompanyPersonWithSignificantControl, CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { Request } from "express";
import { createAndLogError, logger } from "../lib/logger";
import { createOAuthApiClient } from "./apiClientService";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { PSC_KIND_TYPE } from "../constants";

export const getCompanyIndividualPscList = async (request: Request, companyNumber: string): Promise<CompanyPersonWithSignificantControl[]> => {
    const response = await getCompanyPscList(request, companyNumber);
    const companyPscs = response.resource as CompanyPersonsWithSignificantControl;

    logger.debug(`${getCompanyIndividualPscList.name} - company psc list response for company number ${companyNumber}:  ${JSON.stringify(companyPscs)}`);
    if (!companyPscs?.items?.length) {
        logger.info(`${getCompanyIndividualPscList.name} - no pscs have been found for company ${companyNumber}`);

        return [];
    }

    const companyPscList = companyPscs.items;

    // filter out the ceased pscs and only return individuals and super secure pscs
    return companyPscList.filter((psc: CompanyPersonWithSignificantControl) =>
        psc.kind !== undefined && [PSC_KIND_TYPE.INDIVIDUAL, PSC_KIND_TYPE.SUPER_SECURE].includes(psc.kind as PSC_KIND_TYPE) && !psc.ceasedOn
    );
};

// Private method to construct a CompanyPersonsWithSignificantControl object
const constructCompanyPscResponse = (
    response: Resource<CompanyPersonsWithSignificantControl>,
    items: CompanyPersonWithSignificantControl[],
    itemsPerPage: number,
    companyNumber: string
): void => {
    response.resource = {
        items: items,
        startIndex: "0",
        itemsPerPage: itemsPerPage.toString(),
        totalResults: items.length.toString(),
        activeCount: items.filter(item => item.ceasedOn === null || item.ceasedOn === undefined).length.toString(),
        ceasedCount: items.filter(item => item.ceasedOn !== null && item.ceasedOn !== undefined).length.toString(),
        links: {
            self: `company/${companyNumber}/persons-with-significant-control`
        }
    };
};

// Updated code in getCompanyPscList
export const getCompanyPscList = async (request: Request, companyNumber: string): Promise<Resource<CompanyPersonsWithSignificantControl>> => {
    const oAuthApiClient: ApiClient = createOAuthApiClient(request.session);

    logger.debug(`${getCompanyPscList.name} for company number ${companyNumber}`);
    let sdkResponse: Resource<CompanyPersonsWithSignificantControl> | ApiErrorResponse;
    let companyPscsSdkResponse: Resource<CompanyPersonsWithSignificantControl>;
    let allItems: CompanyPersonWithSignificantControl[] = [];
    let startIndex = 0;
    const itemsPerPage = process.env.PSC_DATA_API_FETCH_SIZE ? parseInt(process.env.PSC_DATA_API_FETCH_SIZE, 10) : 100;

    do {
        sdkResponse = await oAuthApiClient.companyPsc.getCompanyPsc(companyNumber, startIndex, itemsPerPage);

        if (!sdkResponse || !sdkResponse.httpStatusCode || sdkResponse.httpStatusCode !== HttpStatusCode.Ok) {
            throw createAndLogError(`${getCompanyPscList.name} - Failed to get company psc list for company number ${companyNumber} with start index ${startIndex} and items per page ${itemsPerPage}`);
        }
        logger.debug(`${getCompanyPscList.name} - company psc list response for company number ${companyNumber} with start index ${startIndex} and items per page ${itemsPerPage}:  ${JSON.stringify(sdkResponse)}`);

        companyPscsSdkResponse = sdkResponse as Resource<CompanyPersonsWithSignificantControl>;

        if (companyPscsSdkResponse.resource?.items?.length) {
            allItems = allItems.concat(companyPscsSdkResponse.resource.items);
            startIndex += itemsPerPage;
        } else {
            break;
        }
    } while (companyPscsSdkResponse.resource?.items?.length);

    constructCompanyPscResponse(companyPscsSdkResponse, allItems, itemsPerPage, companyNumber);

    if (!companyPscsSdkResponse.resource) {
        throw createAndLogError(`${getCompanyPscList.name} returned no resource for company number ${companyNumber}`);
    }

    return companyPscsSdkResponse;
};

import { Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

jest.mock("../../src/services/companyProfileService");

export const COMPANY_NUMBER = "12345678";

export const validCompanyProfile: CompanyProfile = {
    accounts: {
        nextAccounts: {
            periodEndOn: "2019-10-10",
            periodStartOn: "2019-01-01"
        },
        nextDue: "2020-05-31",
        overdue: false
    },
    companyName: "Test Company",
    companyNumber: "12345678",
    companyStatus: "active",
    companyStatusDetail: "company status detail",
    confirmationStatement: {
        lastMadeUpTo: "2019-04-30",
        nextDue: "2020-04-30",
        nextMadeUpTo: "2020-03-15",
        overdue: false
    },
    dateOfCreation: "1972-06-22",
    hasBeenLiquidated: false,
    hasCharges: false,
    hasInsolvencyHistory: false,
    jurisdiction: "england-wales",
    links: {},
    registeredOfficeAddress: {
        addressLineOne: "Line1",
        addressLineTwo: "Line2",
        careOf: "careOf",
        country: "uk",
        locality: "locality",
        poBox: "123",
        postalCode: "POST CODE",
        premises: "premises",
        region: "region"
    },
    sicCodes: ["123"],
    type: "ltd"
};

export const validAddress = {
    addressLine1: "Line1",
    addressLine2: "Line2",
    careOf: "careOf",
    country: "England",
    locality: "locality",
    poBox: "123",
    postalCode: "UB7 0GB",
    premises: "premises"
};

export const validSDKResource: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: validCompanyProfile
};

export const badRequestSDKResource: Resource<CompanyProfile> = {
    httpStatusCode: 400,
    resource: validCompanyProfile
};

export const missingSDKResource: Resource<CompanyProfile> = {
    httpStatusCode: 200,
    resource: undefined
};

export const mockApiErrorResponse: ApiErrorResponse = {
    httpStatusCode: 500,
    errors: [
        {
            error: "Service Unavailable",
            errorValues: {
                resource: "test",
                id: "12345678"
            },
            location: "/test/12345",
            locationType: "endpoint",
            type: "test"
        }
    ]
};

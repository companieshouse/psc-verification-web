import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { getCompanyIndividualPscList, getCompanyPscList } from "../../src/services/companyPscService";
import { COMPANY_NUMBER, EMPTY_COMPANY_PSC_LIST, VALID_COMPANY_PSC_LIST } from "../mocks/companyPsc.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockGetCompanyPsc = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;
let session: Session;

mockCreateOAuthApiClient.mockReturnValue({
    companyPsc: {
        getCompanyPsc: mockGetCompanyPsc
    }
});

describe("companyPscService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        session = new Session();
    });

    it("getCompanyPscList should return 200 OK HttpStatus response", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControl> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource: VALID_COMPANY_PSC_LIST
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControl>);
        const request = {} as Request;

        const response = await getCompanyPscList(request, COMPANY_NUMBER);

        const resource = response.resource as CompanyPersonsWithSignificantControl;
        expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
        expect(resource).toEqual(VALID_COMPANY_PSC_LIST);
        expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyPsc).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyPsc).toHaveBeenCalledWith(COMPANY_NUMBER);

    });
    it("getCompanyPscList should throw an error if HttpStatus is not 200 OK", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControl> = {
            httpStatusCode: HttpStatusCode.ServiceUnavailable
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControl>);
        const request = {} as Request;

        try {
            const response = await getCompanyPscList(request, COMPANY_NUMBER);
            throw new Error("invalid expecting getCompanyPscList to throw error");
        } catch (error: any) {
            expect(error.message).toBe("getCompanyPscList - Failed to get company psc list for company number 12345678");
        }
    });
    it("getCompanyPscList should throw an error if no resource is returned", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControl> = {
            httpStatusCode: HttpStatusCode.Ok
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControl>);
        const request = {} as Request;
        try {
            await getCompanyPscList(request, COMPANY_NUMBER);
            throw new Error("invalid expecting getCompanyPscList to throw error");
        } catch (error: any) {
            expect(error.message).toBe("getCompanyPscList returned no resource for company number 12345678");
        }
    });
    it("getCompanyIndividualPscList should return only individual PSCs", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControl> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource: VALID_COMPANY_PSC_LIST
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControl>);
        const request = {} as Request;

        const individualPscList = await getCompanyIndividualPscList(request, COMPANY_NUMBER);

        expect(individualPscList).toHaveLength(1);
        individualPscList.forEach((item) => {
            expect(item.kind).toEqual("individual-person-with-significant-control");
        });
    });
    it("getCompanyIndividualPscList should return an empty list if no individual PSCs exist for the company", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControl> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource: EMPTY_COMPANY_PSC_LIST
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControl>);
        const request = {} as Request;

        const individualPscList = await getCompanyIndividualPscList(request, COMPANY_NUMBER);
        expect(individualPscList).toHaveLength(0);
    });
});

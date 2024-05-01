import { CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
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
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource: VALID_COMPANY_PSC_LIST
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControlResource>);
        const request = {} as Request;
        request.query = { companyNumber: COMPANY_NUMBER };

        const response = await getCompanyPscList(request);

        const resource = response.resource as CompanyPersonsWithSignificantControlResource;
        expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
        expect(resource).toEqual(VALID_COMPANY_PSC_LIST);
        expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyPsc).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyPsc).toHaveBeenCalledWith(COMPANY_NUMBER);

    });
    it("getCompanyPscList throw an error if HttpStatus is not 200 OK", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.ServiceUnavailable
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControlResource>);
        const request = {} as Request;
        request.query = { companyNumber: COMPANY_NUMBER };

        try {
            const response = await getCompanyPscList(request);
        } catch (error: any) {
            expect(error.message).toBe("Http status code 503 - Failed to get company psc list for company number 12345678");
        }
    });
    it("getCompanyPscList throw and error if no resource is present", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.Ok
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControlResource>);
        const request = {} as Request;
        request.query = { companyNumber: COMPANY_NUMBER };
        try {
            await getCompanyPscList(request);
        } catch (error: any) {
            expect(error.message).toBe("getCompanyPscList returned no resource for company number 12345678");
        }
    });
    it("getCompanyIndividualPscList should return only individual pscs", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource: VALID_COMPANY_PSC_LIST
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControlResource>);
        const request = {} as Request;
        request.query = { companyNumber: COMPANY_NUMBER };

        const individualPscList = await getCompanyIndividualPscList(request);

        expect(individualPscList).toHaveLength(1);
        individualPscList.forEach((item) => {
            expect(item.kind).toEqual("individual-person-with-significant-control");
        });
    });
    it("getCompanyIndividualPscList will return an empty list if no individual pscs exist for company", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource: EMPTY_COMPANY_PSC_LIST
        };
        mockGetCompanyPsc.mockResolvedValueOnce(mockResponse as ApiResponse<CompanyPersonsWithSignificantControlResource>);
        const request = {} as Request;
        request.query = { companyNumber: COMPANY_NUMBER };

        const individualPscList = await getCompanyIndividualPscList(request);
        expect(individualPscList).toHaveLength(0);
    });
});

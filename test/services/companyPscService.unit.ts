import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { PSC_KIND_TYPE } from "../../src/constants";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { getCompanyIndividualPscList, getCompanyPscList } from "../../src/services/companyPscService";
import { COMPANY_NUMBER, EMPTY_COMPANY_PSC_LIST, SUPER_SECURE_PSCS_EXCLUSIVE_LIST, VALID_COMPANY_PSC_ITEMS, VALID_COMPANY_PSC_LIST_PAGE_1, VALID_COMPANY_PSC_LIST_PAGE_2, VALID_COMPANY_PSC_LIST_PAGE_FINAL } from "../mocks/companyPsc.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockGetCompanyPsc = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;
let session: Session;
const originalEnv = { ...process.env };

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

    afterEach(() => {
        process.env = { ...originalEnv };
    });

    it("getCompanyPscList should return 200 OK HttpStatus response and with All PSCs when fetch limit is small", async () => {
        process.env.PSC_DATA_API_FETCH_SIZE = "3";
        mockGetCompanyPsc.mockResolvedValueOnce({
            httpStatusCode: HttpStatusCode.Ok,
            resource: VALID_COMPANY_PSC_LIST_PAGE_1
        } as ApiResponse<CompanyPersonsWithSignificantControl>)
            .mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALID_COMPANY_PSC_LIST_PAGE_2
            } as ApiResponse<CompanyPersonsWithSignificantControl>)
            .mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALID_COMPANY_PSC_LIST_PAGE_FINAL
            } as ApiResponse<CompanyPersonsWithSignificantControl>);
        const request = {} as Request;

        const response = await getCompanyPscList(request, COMPANY_NUMBER);

        const resource = response.resource as CompanyPersonsWithSignificantControl;
        expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
        expect(resource.items).toEqual([...VALID_COMPANY_PSC_LIST_PAGE_1.items, ...VALID_COMPANY_PSC_LIST_PAGE_2.items]);

        expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
        expect(mockGetCompanyPsc).toHaveBeenCalledTimes(3);
        expect(mockGetCompanyPsc).toHaveBeenCalledWith(COMPANY_NUMBER, 0, 3, {});
        expect(mockGetCompanyPsc).toHaveBeenCalledWith(COMPANY_NUMBER, 3, 3, {});
        expect(mockGetCompanyPsc).toHaveBeenCalledWith(COMPANY_NUMBER, 6, 3, {});

    });

    it("getCompanyPscList should throw an error if HttpStatus is not 200 OK", async () => {
        const mockResponse: ApiResponse<CompanyPersonsWithSignificantControl> = {
            httpStatusCode: HttpStatusCode.ServiceUnavailable
        };
        const request = {} as Request;

        try {
            const response = await getCompanyPscList(request, COMPANY_NUMBER);
            throw new Error("invalid expecting getCompanyPscList to throw error");
        } catch (error: any) {
            expect(error.message).toBe("Failed to get company psc list for companyNumber=\"12345678\" with start index 0 and items per page 100");
        }
    });

    it("getCompanyPscList should return a resource with empty items if no resource is returned by the SDK", async () => {
        mockGetCompanyPsc.mockResolvedValueOnce({
            httpStatusCode: HttpStatusCode.Ok
        } as ApiResponse<CompanyPersonsWithSignificantControl>);
        const request = {} as Request;

        const response = await getCompanyPscList(request, COMPANY_NUMBER);

        expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
        expect(response.resource).toEqual({
            items: [],
            totalResults: "0",
            itemsPerPage: "100",
            activeCount: "0",
            ceasedCount: "0",
            links: {
                self: "company/12345678/persons-with-significant-control"
            },
            startIndex: "0"
        });
    });

    it("getCompanyIndividualPscList should return only individual and super secure PSCs", async () => {
        const validCompanyPscs: CompanyPersonsWithSignificantControl = {
            ceasedCount: "2",
            itemsPerPage: process.env.PSC_DATA_API_FETCH_SIZE,
            totalResults: "5",
            activeCount: "4",
            links: {
                self: "company/123456/persons-with-significant-control"
            },
            items: ([...VALID_COMPANY_PSC_ITEMS, ...SUPER_SECURE_PSCS_EXCLUSIVE_LIST] as CompanyPersonsWithSignificantControl["items"])
        };
        const emptyCompanyPscs: CompanyPersonsWithSignificantControl = {
            ceasedCount: "0",
            itemsPerPage: process.env.PSC_DATA_API_FETCH_SIZE,
            totalResults: "0",
            activeCount: "0",
            links: {
                self: "company/123456/persons-with-significant-control"
            },
            items: []
        };

        mockGetCompanyPsc.mockResolvedValueOnce({
            httpStatusCode: HttpStatusCode.Ok,
            resource: validCompanyPscs
        } as ApiResponse<CompanyPersonsWithSignificantControl>)
            .mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: emptyCompanyPscs
            } as ApiResponse<CompanyPersonsWithSignificantControl>);

        const request = {} as Request;

        const individualPscList = await getCompanyIndividualPscList(request, COMPANY_NUMBER);

        expect(individualPscList).toHaveLength(3);
        expect(individualPscList.map(p => p.kind)).toMatchObject(expect.arrayContaining([PSC_KIND_TYPE.INDIVIDUAL, PSC_KIND_TYPE.SUPER_SECURE]));
    });

    it("getCompanyIndividualPscList should return an empty list if no individual or super secure PSCs exist for the company", async () => {
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

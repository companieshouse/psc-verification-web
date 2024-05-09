import { PersonWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { getPscIndividual } from "../../src/services/pscService";
import { COMPANY_NUMBER, PSC_ID, PSC_INDIVIDUAL } from "../mocks/Psc.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockGetPscIndividual = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;
let session: Session;

mockCreateOAuthApiClient.mockReturnValue({
    pscService: {
        getPscIndividual: mockGetPscIndividual
    }
});

describe("pscServiceIndividual", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        session = new Session();
    });
    it("getPscIndividual should return 200 OK HttpStatus response", async () => {
        const mockResponse: ApiResponse<PersonWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.Ok,
            resource: PSC_INDIVIDUAL
        };
        mockGetPscIndividual.mockResolvedValueOnce(mockResponse as ApiResponse<PersonWithSignificantControlResource>);
        const request = {} as Request;

        const response = await getPscIndividual(request, COMPANY_NUMBER, PSC_ID);

        const resource = response.resource as PersonWithSignificantControlResource;
        expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
        expect(resource).toEqual(PSC_INDIVIDUAL);
        expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
        expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
        expect(mockGetPscIndividual).toHaveBeenCalledWith(COMPANY_NUMBER, PSC_ID);

    });
    it("getPscIndividual should throw an error if HttpStatus is not 200 OK", async () => {
        const mockResponse: ApiResponse<PersonWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.ServiceUnavailable
        };
        mockGetPscIndividual.mockResolvedValueOnce(mockResponse as ApiResponse<PersonWithSignificantControlResource>);
        const request = {} as Request;

        try {
            const response = await getPscIndividual(request, COMPANY_NUMBER, PSC_ID);
            throw new Error("invalid expecting getPscIndividual to throw error");
        } catch (error: any) {
            expect(error.message).toBe("getPscIndividual - Failed to get details for PSC Id  67edfE436y35hetsie6zuAZtr");
        }
    });
    it("getPscIndividual should throw an error if no resource is returned", async () => {
        const mockResponse: ApiResponse<PersonWithSignificantControlResource> = {
            httpStatusCode: HttpStatusCode.Ok
        };
        mockGetPscIndividual.mockResolvedValueOnce(mockResponse as ApiResponse<PersonWithSignificantControlResource>);
        const request = {} as Request;
        try {
            await getPscIndividual(request, COMPANY_NUMBER, PSC_ID);
            throw new Error("invalid expecting getPscIndividual to throw error");
        } catch (error: any) {
            expect(error.message).toBe("getPscIndividual returned no resource for PSC Id 67edfE436y35hetsie6zuAZtr");
        }
    });
});

import { PersonWithSignificantControl, PscIndWithVerificationState, PscIndWithVerificationStateResource } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import Resource, { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createApiKeyClient, createOAuthApiClient } from "../../src/services/apiClientService";
import { getPscIndWithVerificationState, getPscIndividual } from "../../src/services/pscService";
import { COMPANY_NUMBER, PSC_ID, PSC_INDIVIDUAL, PSC_VERIFICATION_STATE } from "../mocks/psc.mock";
import { PSC_NOTIFICATION_ID } from "../mocks/pscVerification.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockGetPscIndividual = jest.fn();
const mockGetPscIndWithVerificationState = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    pscService: {
        getPscIndividual: mockGetPscIndividual
    }
});

const mockCreateApiKeyClient = createApiKeyClient as jest.Mock;
mockCreateApiKeyClient.mockReturnValue({
    pscService: {
        getPscIndWithVerificationState: mockGetPscIndWithVerificationState
    }
});

describe("PSC Service", () => {
    const request = {} as Request;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getPscIndividual", () => {

        it("getPscIndividual should return 200 OK HttpStatus response", async () => {
            const mockResponse: ApiResponse<PersonWithSignificantControl> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: PSC_INDIVIDUAL
            };
            mockGetPscIndividual.mockResolvedValueOnce(mockResponse as ApiResponse<PersonWithSignificantControl>);

            const response = await getPscIndividual(request, COMPANY_NUMBER, PSC_ID);

            const resource = response.resource as PersonWithSignificantControl;
            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            expect(resource).toEqual(PSC_INDIVIDUAL);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
            expect(mockGetPscIndividual).toHaveBeenCalledWith(COMPANY_NUMBER, PSC_ID);

        });
        it("getPscIndividual should throw an error if HttpStatus is not 200 OK", async () => {
            const mockResponse: ApiResponse<PersonWithSignificantControl> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockGetPscIndividual.mockResolvedValueOnce(mockResponse as ApiResponse<PersonWithSignificantControl>);

            try {
                const response = await getPscIndividual(request, COMPANY_NUMBER, PSC_ID);
                throw new Error("invalid expecting getPscIndividual to throw error");
            } catch (error: any) {
                expect(error.message).toBe("getPscIndividual - Failed to get details for PSC Id  67edfE436y35hetsie6zuAZtr");
            }
        });
        it("getPscIndividual should throw an error if no resource is returned", async () => {
            const mockResponse: ApiResponse<PersonWithSignificantControl> = {
                httpStatusCode: HttpStatusCode.Ok
            };
            mockGetPscIndividual.mockResolvedValueOnce(mockResponse as ApiResponse<PersonWithSignificantControl>);
            try {
                await getPscIndividual(request, COMPANY_NUMBER, PSC_ID);
                throw new Error("invalid expecting getPscIndividual to throw error");
            } catch (error: any) {
                expect(error.message).toBe("getPscIndividual - no resource returned for PSC Id 67edfE436y35hetsie6zuAZtr");
            }
        });
    });

    describe("getPscIndWithVerificationState endpoint", () => {

        it("should retrieve the resource by its ID", async () => {
            const mockGet: Resource<PscIndWithVerificationStateResource> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: PSC_VERIFICATION_STATE
            };

            mockGetPscIndWithVerificationState.mockResolvedValueOnce(mockGet);

            const response = await getPscIndWithVerificationState(COMPANY_NUMBER, PSC_NOTIFICATION_ID);

            const resource = response.resource as PscIndWithVerificationState;
            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            expect(resource).toEqual(PSC_VERIFICATION_STATE);
            expect(mockCreateApiKeyClient).toHaveBeenCalledTimes(1);
            expect(mockGetPscIndWithVerificationState).toHaveBeenCalledTimes(1);
            expect(mockGetPscIndWithVerificationState).toHaveBeenCalledWith(COMPANY_NUMBER, PSC_NOTIFICATION_ID);
        });

        it("should throw an error when the response resource is empty", async () => {
            const mockGet: Resource<PscIndWithVerificationStateResource> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: undefined
            };

            mockGetPscIndWithVerificationState.mockResolvedValueOnce(mockGet);

            await expect(getPscIndWithVerificationState(COMPANY_NUMBER, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`getPscIndWithVerificationState - no PSC with verification state returned for companyNumber: ${COMPANY_NUMBER} and PSC notification ID: ${PSC_NOTIFICATION_ID}`));
        });

        it("should throw an Error when no response from API", async () => {
            mockGetPscIndWithVerificationState.mockResolvedValueOnce(undefined);

            await expect(getPscIndWithVerificationState(COMPANY_NUMBER, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`getPscIndWithVerificationState -  Failed to get PSC with verification state for companyNumber: ${COMPANY_NUMBER} and PSC notification ID: ${PSC_NOTIFICATION_ID}`));
        });
        it("should throw an Error when API status is unavailable", async () => {
            const mockGet: Resource<PscIndWithVerificationStateResource> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };

            mockGetPscIndWithVerificationState.mockResolvedValueOnce(mockGet);

            await expect(getPscIndWithVerificationState(COMPANY_NUMBER, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`getPscIndWithVerificationState -  Failed to get PSC with verification state for companyNumber: ${COMPANY_NUMBER} and PSC notification ID: ${PSC_NOTIFICATION_ID}`));
        });

    });
});

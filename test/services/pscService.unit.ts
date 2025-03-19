import { PersonWithSignificantControl, PscVerificationState } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import Resource, { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { getPscIndividual, getPscVerificationState } from "../../src/services/pscService";
import { COMPANY_NUMBER, PSC_ID, PSC_INDIVIDUAL, PSC_VERIFICATION_STATE } from "../mocks/psc.mock";
import { PSC_NOTIFICATION_ID } from "../mocks/pscVerification.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockGetPscIndividual = jest.fn();
const mockGetPscVerificationState = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    pscService: {
        getPscIndividual: mockGetPscIndividual,
        getPscVerificationState: mockGetPscVerificationState
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

    describe("getPscVerificationState as POST endpoint", () => {

        it("should retrieve the resource by its ID", async () => {
            const mockPost: Resource<PscVerificationState> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: PSC_VERIFICATION_STATE
            };

            mockGetPscVerificationState.mockResolvedValueOnce(mockPost);

            const response = await getPscVerificationState(request, PSC_NOTIFICATION_ID);

            const resource = response.resource as PscVerificationState;
            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            expect(resource).toEqual(PSC_VERIFICATION_STATE);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetPscVerificationState).toHaveBeenCalledTimes(1);
            expect(mockGetPscVerificationState).toHaveBeenCalledWith(PSC_NOTIFICATION_ID);
        });

        it("should throw an error when the response resource is empty", async () => {
            const mockGet: Resource<PscVerificationState> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: undefined
            };

            mockGetPscVerificationState.mockResolvedValueOnce(mockGet);

            await expect(getPscVerificationState(request, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`getPscVerificationState - no resource returned for PSC notification ID: ${PSC_NOTIFICATION_ID}`));
        });

        it("should throw an Error when no response from API", async () => {
            mockGetPscVerificationState.mockResolvedValueOnce(undefined);
            const request = {} as Request;

            await expect(getPscVerificationState(request, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`getPscVerificationState - Failed to get verification status for PSC notification ID: ${PSC_NOTIFICATION_ID}`));
        });
        it("should throw an Error when API status is unavailable", async () => {
            const mockGet: Resource<PscVerificationState> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };

            mockGetPscVerificationState.mockResolvedValueOnce(mockGet);

            await expect(getPscVerificationState(request, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`getPscVerificationState - Failed to get verification status for PSC notification ID: ${PSC_NOTIFICATION_ID}`));
        });

    });
});

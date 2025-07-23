import { PersonWithSignificantControl, PersonWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import Resource, { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { createApiKeyClient } from "../../src/services/apiClientService";
import { getPscIndividual } from "../../src/services/pscService";
import { COMPANY_NUMBER, PSC_ID, PSC_INDIVIDUAL } from "../mocks/psc.mock";
import { PSC_NOTIFICATION_ID } from "../mocks/pscVerification.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockGetPscIndividual = jest.fn();

const mockCreateApiKeyClient = createApiKeyClient as jest.Mock;
mockCreateApiKeyClient.mockReturnValue({
    pscService: {
        getPscIndividual: mockGetPscIndividual
    }
});

describe("PSC Service", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getPscIndividual endpoint", () => {
        const REQUEST = {} as any;

        it("getPscIndividual should return 200 OK HttpStatus response", async () => {
            const mockGet: Resource<PersonWithSignificantControl> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: PSC_INDIVIDUAL
            };

            mockGetPscIndividual.mockResolvedValueOnce(mockGet);
            const response = await getPscIndividual(REQUEST, COMPANY_NUMBER, PSC_NOTIFICATION_ID);

            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            expect(response.resource).toEqual(PSC_INDIVIDUAL);
            expect(mockCreateApiKeyClient).toHaveBeenCalledTimes(1);
            expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
            expect(mockGetPscIndividual).toHaveBeenCalledWith(COMPANY_NUMBER, PSC_NOTIFICATION_ID, {});
        });

        it("getPscIndividual should throw an Error if HttpStatus is not 200 OK", async () => {
            const mockResponse: ApiResponse<PersonWithSignificantControl> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };

            mockGetPscIndividual.mockResolvedValueOnce(mockResponse as ApiResponse<PersonWithSignificantControl>);

            try {
                await getPscIndividual(REQUEST, COMPANY_NUMBER, PSC_ID);
                throw new Error("invalid expecting getPscIndividual to throw error");
            } catch (error: any) {
                expect(error.message).toBe("Failed to get PSC with verification state for companyNumber=\"12345678\", notificationId=\"67edfE436y35hetsie6zuAZtr\"");
            }
        });

        it("should throw an Error when the response resource is undefined", async () => {
            const mockGet: Resource<PersonWithSignificantControl> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: undefined
            };

            mockGetPscIndividual.mockResolvedValueOnce(mockGet);

            await expect(getPscIndividual(REQUEST, COMPANY_NUMBER, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`no PSC with verification state returned for companyNumber="${COMPANY_NUMBER}", notificationId="${PSC_NOTIFICATION_ID}"`));
        });

        it("should throw an Error when there is no response", async () => {
            mockGetPscIndividual.mockResolvedValueOnce(undefined);

            await expect(getPscIndividual(REQUEST, COMPANY_NUMBER, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`Failed to get PSC with verification state for companyNumber="${COMPANY_NUMBER}", notificationId="${PSC_NOTIFICATION_ID}"`));
        });

        it("should throw an Error when the API resource is missing", async () => {
            const mockGet: Resource<PersonWithSignificantControlResource> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };

            mockGetPscIndividual.mockResolvedValueOnce(mockGet);

            await expect(getPscIndividual(REQUEST, COMPANY_NUMBER, PSC_NOTIFICATION_ID)).rejects.toThrow(
                new Error(`Failed to get PSC with verification state for companyNumber="${COMPANY_NUMBER}", notificationId="${PSC_NOTIFICATION_ID}"`));
        });

    });
});

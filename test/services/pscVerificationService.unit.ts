import { Resource } from "@companieshouse/api-sdk-node";
import { PlannedMaintenance, PscVerification, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createApiKeyClient, createOAuthApiClient } from "../../src/services/apiClientService";
import { checkPlannedMaintenance, createPscVerification, getPscVerification, getValidationStatus, patchPscVerification } from "../../src/services/pscVerificationService";
import { INDIVIDUAL_VERIFICATION_CREATED, INDIVIDUAL_VERIFICATION_FULL, INDIVIDUAL_VERIFICATION_PATCH, INITIAL_PSC_DATA, PATCH_INDIVIDUAL_DATA, PLANNED_MAINTENANCE, PSC_VERIFICATION_ID, TRANSACTION_ID, VALIDATION_STATUS_INVALID, VALIDATION_STATUS_RESP_VALID, mockValidationStatusNameError } from "../mocks/pscVerification.mock";
import { CREATED_PSC_TRANSACTION } from "../mocks/transaction.mock";
import { logger } from "../../src/lib/logger";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockCreatePscVerification = jest.fn();
const mockGetPscVerification = jest.fn();
const mockPatchPscVerification = jest.fn();
const mockGetValidationStatus = jest.fn();
const mockCheckPlannedMaintenance = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;
const mockCreateApiKeyClient = createApiKeyClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    pscVerificationService: {
        postPscVerification: mockCreatePscVerification,
        getPscVerification: mockGetPscVerification,
        patchPscVerification: mockPatchPscVerification,
        getValidationStatus: mockGetValidationStatus
    }
});

mockCreateApiKeyClient.mockReturnValue({
    pscVerificationService: {
        checkPlannedMaintenance: mockCheckPlannedMaintenance
    }
});

describe("pscVerificationService", () => {
    const req = {} as Request;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createPscVerification", () => {
        it("should return the created initial resource on success", async () => {
            const mockCreate: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.Created,
                resource: INDIVIDUAL_VERIFICATION_CREATED
            };
            mockCreatePscVerification.mockResolvedValueOnce(mockCreate);

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA);

            expect(response.httpStatusCode).toBe(HttpStatusCode.Created);
            const castedResource = response.resource as PscVerification;
            expect(castedResource).toEqual(INDIVIDUAL_VERIFICATION_CREATED);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledWith(TRANSACTION_ID, INITIAL_PSC_DATA);
        });
        it("should throw an Error when no response from API", async () => {
            mockCreatePscVerification.mockResolvedValueOnce(undefined);

            await expect(createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA)).rejects.toThrow(
                new Error("createPscVerification - PSC Verification POST request returned no response for transaction 11111-22222-33333"));
        });
        it("should throw an Error when API status is unavailable", async () => {
            const mockCreate: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockCreatePscVerification.mockResolvedValueOnce(mockCreate);

            await expect(createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA)).rejects.toThrow(
                new Error("createPscVerification - HTTP status code 503 - Failed to POST PSC Verification for transaction 11111-22222-33333"));
        });
    });

    describe("getPscVerification", () => {
        it("should retrieve the resource by its id", async () => {
            const mockGet: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: INDIVIDUAL_VERIFICATION_FULL
            };
            mockGetPscVerification.mockResolvedValueOnce(mockGet);

            const response = await getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID);

            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            const castedResource = response.resource as PscVerification;
            expect(castedResource).toEqual(INDIVIDUAL_VERIFICATION_FULL);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
            expect(mockGetPscVerification).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);
        });
        it("should throw an Error when no response from API", async () => {
            mockGetPscVerification.mockResolvedValueOnce(undefined);

            await expect(getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                new Error("getPscVerification - PSC Verification GET request returned no response for transaction 11111-22222-33333, pscVerification 662a0de6a2c6f9aead0f32ab"));
        });
        it("should throw an Error when API status is unavailable", async () => {
            const mockGet: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockGetPscVerification.mockResolvedValueOnce(mockGet);

            await expect(getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                new Error("getPscVerification - HTTP status code 503 - Failed to GET PSC Verification for transaction 11111-22222-33333, pscVerification 662a0de6a2c6f9aead0f32ab"));
        });
    });

    describe("patchPscVerification", () => {
        it("should return the patched resource on success", async () => {
            const mockPatch: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: INDIVIDUAL_VERIFICATION_PATCH
            };
            mockPatchPscVerification.mockResolvedValueOnce(mockPatch);

            const response = await patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA);

            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            const castedResource = response.resource as PscVerification;
            expect(castedResource).toEqual(INDIVIDUAL_VERIFICATION_PATCH);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA);
        });
        it("should throw an Error when no response from API", async () => {
            mockPatchPscVerification.mockResolvedValueOnce(undefined);

            await expect(patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA)).rejects.toThrow(
                new Error("patchPscVerification - PSC Verification PATCH request returned no response for resource with transactionId 11111-22222-33333, pscVerificationId 662a0de6a2c6f9aead0f32ab"));
        });
        it("should throw an Error when API status is unavailable", async () => {
            const mockPatch: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockPatchPscVerification.mockResolvedValueOnce(mockPatch);

            await expect(patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA)).rejects.toThrow(
                new Error("patchPscVerification - Http status code 503 - Failed to PATCH PSC Verification for resource with transactionId 11111-22222-33333, pscVerificationId 662a0de6a2c6f9aead0f32ab"));
        });
    });

    describe("checkPlannedMaintenance", () => {
        it("should return the Planned Maintenance Response", async () => {
            const mockPlannedMaintenance: ApiResponse<PlannedMaintenance> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: PLANNED_MAINTENANCE
            };
            mockCheckPlannedMaintenance.mockResolvedValueOnce(mockPlannedMaintenance);

            const response = await checkPlannedMaintenance(req);

            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            const castedResource = response.resource as PlannedMaintenance;
            expect(castedResource).toEqual(PLANNED_MAINTENANCE);
            expect(mockCreateApiKeyClient).toHaveBeenCalledTimes(1);
            expect(mockCheckPlannedMaintenance).toHaveBeenCalledTimes(1);
            expect(mockCheckPlannedMaintenance).toHaveBeenCalledWith();
        });
        it("should throw an Error when no response from API", async () => {
            mockCheckPlannedMaintenance.mockResolvedValueOnce(undefined);

            await expect(checkPlannedMaintenance(req)).rejects.toThrow(
                new Error("checkPlannedMaintenance - PSC Verification GET maintenance request returned no response"));
        });
        it("should throw an Error when API status is unavailable", async () => {
            const mockPlannedMaintenance: ApiResponse<PlannedMaintenance> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockCheckPlannedMaintenance.mockResolvedValueOnce(mockPlannedMaintenance);

            await expect(checkPlannedMaintenance(req)).rejects.toThrow(
                new Error("checkPlannedMaintenance - HTTP status code 503 - Failed to GET Planned Maintenance response"));
        });
    });

    describe("getValidationStatus", () => {
        let expected: Resource<ValidationStatusResponse> | ApiErrorResponse;

        it("should return status 200 OK with no errors when the validation status is valid", async () => {
            expected = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: {
                    isValid: true,
                    errors: []
                }
            } as Resource<ValidationStatusResponse>;

            const mockValidationStatus: Resource<ValidationStatusResponse> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALIDATION_STATUS_RESP_VALID
            };
            mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatus);

            const response = await getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID);

            expect(response).toEqual(expected);
            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            const castedResource = response as unknown as ValidationStatusResponse;
            expect(castedResource).toEqual(expected);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);
        });

        it("should return status 200 OK with a validation error when there is a UVID name mismatch", async () => {
            jest.spyOn(logger, "error").mockImplementation(() => {});

            expected = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: {
                    isValid: false,
                    errors: [
                        mockValidationStatusNameError
                    ]
                }
            } as Resource<ValidationStatusResponse>;

            const mockValidationStatus: Resource<ValidationStatusResponse> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALIDATION_STATUS_INVALID
            };
            mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatus);

            const response = await getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID);

            expect(response).toEqual(expected);
            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            const castedResource = response as unknown as ValidationStatusResponse;
            expect(castedResource).toEqual(expected);
            expect(logger.error).toHaveBeenCalled();

            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);

        });

        it("should throw an error when the HTTP status code is not 200 OK", async () => {
            const errorMessage = "There was an error!";
            const errorResponse: ApiErrorResponse = {
                httpStatusCode: 404,
                errors: [{ error: errorMessage }]
            };

            mockGetValidationStatus.mockResolvedValueOnce(errorResponse);

            await expect(getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrowErrorMatchingInlineSnapshot(
                `"getValidationStatus - Error getting validation status: HTTP response is: 404 for transaction 11111-22222-33333, pscVerification 662a0de6a2c6f9aead0f32ab"`);

            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);

        });

        it("should throw an error when the response is null", async () => {
            mockGetValidationStatus.mockResolvedValueOnce(null);

            await expect(getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrowErrorMatchingInlineSnapshot(
                `"getValidationStatus - PSC Verification GET validation status request did not return a response for transaction 11111-22222-33333, pscVerification 662a0de6a2c6f9aead0f32ab"`
            );

            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);
        });

        it("should throw an error when the validationStatus.resource is undefined", async () => {
            const mockValidationStatus: Resource<ValidationStatusResponse> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: undefined
            };

            mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatus);

            await expect(getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrowErrorMatchingInlineSnapshot(
                `"getValidationStatus - Error getting validation status for transaction 11111-22222-33333, pscVerification 662a0de6a2c6f9aead0f32ab"`
            );

            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);

        });
    });
});

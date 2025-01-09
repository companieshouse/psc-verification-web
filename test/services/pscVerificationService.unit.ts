import { PscVerification, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { createPscVerification, getPscVerification, getValidationStatus, patchPscVerification } from "../../src/services/pscVerificationService";
import { INDIVIDUAL_VERIFICATION_CREATED, INDIVIDUAL_VERIFICATION_FULL, INDIVIDUAL_VERIFICATION_PATCH, INITIAL_PSC_DATA, PATCH_INDIVIDUAL_DATA, PSC_VERIFICATION_ID, TRANSACTION_ID, VALIDATION_STATUS_INVALID, VALIDATION_STATUS_VALID, mockValidationStatusNameError } from "../mocks/pscVerification.mock";
import { CREATED_PSC_TRANSACTION } from "../mocks/transaction.mock";
import { Resource } from "@companieshouse/api-sdk-node";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { logger } from "../../src/lib/logger";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockCreatePscVerification = jest.fn();
const mockGetPscVerification = jest.fn();
const mockPatchPscVerification = jest.fn();
const mockGetValidationStatus = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    pscVerificationService: {
        postPscVerification: mockCreatePscVerification,
        getPscVerification: mockGetPscVerification,
        patchPscVerification: mockPatchPscVerification,
        getValidationStatus: mockGetValidationStatus
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
                resource: VALIDATION_STATUS_VALID
            };
            mockGetValidationStatus.mockResolvedValueOnce(mockValidationStatus);

            const response = await getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID);

            expect(response).toEqual(expected);
            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            const castedResource = response as ValidationStatusResponse;
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
            const castedResource = response as ValidationStatusResponse;
            expect(castedResource).toEqual(expected);
            expect(logger.error).toHaveBeenCalled();

            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);

        });

        it("should throw an error when the HTTP status code is not 200 OK", async () => {
            expected = {
                httpStatusCode: HttpStatusCode.BadRequest
            } as ApiErrorResponse;

            mockGetValidationStatus.mockResolvedValueOnce(expected);

            await expect(getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrowErrorMatchingInlineSnapshot(
                `"getValidationStatus - HTTP status response code is not valid: 400 - Failed to GET PSC Verification validation status for transaction 11111-22222-33333, pscVerification 662a0de6a2c6f9aead0f32ab"`
            );

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
                `"getValidationStatus - Error retrieving the validation status for transaction 11111-22222-33333, pscVerification 662a0de6a2c6f9aead0f32ab"`
            );

            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);

        });
    });
});

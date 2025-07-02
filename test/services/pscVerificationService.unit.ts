import { Resource } from "@companieshouse/api-sdk-node";
import { PlannedMaintenance, PscVerification, PscVerificationData, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiErrorResponse, ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createApiKeyClient, createOAuthApiClient } from "../../src/services/apiClientService";
import { checkPlannedMaintenance, createPscVerification, getPscVerification, getValidationStatus, patchPscVerification } from "../../src/services/pscVerificationService";
import { INDIVIDUAL_VERIFICATION_CREATED, INDIVIDUAL_VERIFICATION_FULL, INDIVIDUAL_VERIFICATION_PATCH, INITIAL_PSC_DATA, PATCH_INDIVIDUAL_DATA, PLANNED_MAINTENANCE, PSC_VERIFICATION_ID, TRANSACTION_ID, VALIDATION_STATUS_INVALID_NAME, VALIDATION_STATUS_RESP_VALID, mockValidationStatusNameError } from "../mocks/pscVerification.mock";
import { CREATED_PSC_TRANSACTION } from "../mocks/transaction.mock";
import { logger } from "../../src/lib/logger";
import { HttpError } from "../../src/lib/errors/httpError";
import { Responses } from "../../src/constants";
import { DataIntegrityError } from "../../src/lib/errors/dataIntegrityError";

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
            if ("resource" in response) {
                const castedResource = response.resource as PscVerification;
                expect(castedResource).toEqual(INDIVIDUAL_VERIFICATION_CREATED);
            } else {
                throw new Error("Response does not contain a resource");
            }
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledWith(TRANSACTION_ID, INITIAL_PSC_DATA, {});
        });

        it("should throw an error when the response is empty", async () => {
            const mockCreate: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.Created,
                resource: undefined
            };

            mockCreatePscVerification.mockResolvedValueOnce(mockCreate);

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA).catch((error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty("message", `PSC Verification API POST request returned no resource for transactionId="${TRANSACTION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw an error when PscVerification is undefined", async () => {
            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, undefined as any).catch((error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty("message", `Aborting: PscVerificationData is required for PSC Verification POST request for transactionId="${TRANSACTION_ID}"`);
            });
            expect(response).toBeUndefined();
        });
        it("should throw an error when companyNumber is undefined", async () => {
            const incompleteData = {
                pscNotificationId: INITIAL_PSC_DATA.pscNotificationId
            };

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, incompleteData as any).catch((error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty("message", `Aborting: companyNumber is required for PSC Verification POST request for transactionId="${TRANSACTION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw an Error when no response from API", async () => {
            mockCreatePscVerification.mockResolvedValueOnce(undefined);

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA).catch((error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty("message", `PSC Verification POST request returned no response for transactionId="${TRANSACTION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw an Error when API status is unknown", async () => {
            mockCreatePscVerification.mockResolvedValueOnce({});

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA).catch((error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty("message", `HTTP status code is undefined - Failed to POST PSC Verification for transactionId="${TRANSACTION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it.each([400, 404])("should throw a DataIntegrityError when API status is 400/404", async (status) => {
            const mockCreate: Resource<PscVerification> = {
                httpStatusCode: status
            };
            mockCreatePscVerification.mockResolvedValueOnce(mockCreate);

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA).catch((error) => {
                expect(error).toBeInstanceOf(DataIntegrityError);
                expect(error).toHaveProperty("type", "PSC_DATA");
                expect(error).toHaveProperty("message", `received ${status} - Failed to POST PSC Verification for transactionId="${TRANSACTION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it.each([400, 404])("should parse API error response text when available & API status is 400/404", async (status) => {
            const errorMessage = "Error message";
            const mockCreate = {
                httpStatusCode: status,
                resource: {
                    errors: [{
                        error: errorMessage
                    }]
                }
            };
            mockCreatePscVerification.mockResolvedValueOnce(mockCreate);

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA).catch((error) => {
                expect(error).toBeInstanceOf(DataIntegrityError);
                expect(error).toHaveProperty("type", "PSC_DATA");
                expect(error).toHaveProperty("message", `received ${status} - ${errorMessage}`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw a HttpError when an unsuccessful API status is otherwise unhandled", async () => {
            const mockCreate: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockCreatePscVerification.mockResolvedValueOnce(mockCreate);

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA).catch((error) => {
                expect(error).toBeInstanceOf(HttpError);
                expect(error).toHaveProperty("status", HttpStatusCode.ServiceUnavailable);
                expect(error).toHaveProperty("message", `Failed to POST PSC Verification for transactionId="${TRANSACTION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw a DataIntegrityError when pscNotificationId is undefined", async () => {
            const incompleteData: PscVerificationData = {
                companyNumber: INITIAL_PSC_DATA.companyNumber
            };

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, incompleteData).catch((error) => {
                expect(error).toBeInstanceOf(DataIntegrityError);
                expect(error).toHaveProperty("message", `Aborting: pscNotificationId is required for PSC Verification POST request for transactionId="${TRANSACTION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw a DataIntegrityError when there's a problem with psc data", async () => {

            const mockCastApiErrorResponse = {
                httpStatusCode: HttpStatusCode.InternalServerError,
                errors: [
                    {
                        errors: [
                            {
                                error: "Service Unavailable",
                                errorValues: {
                                    error: Responses.PROBLEM_WITH_PSC_DATA,
                                    id: "12345678"
                                },
                                location: "/test/12345",
                                locationType: "endpoint",
                                type: "test"
                            }
                        ]
                    }
                ]
            };

            mockCreatePscVerification.mockResolvedValueOnce(mockCastApiErrorResponse);

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_PSC_DATA).catch((error) => {
                expect(error).toBeInstanceOf(DataIntegrityError);
                expect(error).toHaveProperty("type", "PSC_DATA");
                expect(error).toHaveProperty("message", `We are currently unable to process a Verification filing for this PSC - Failed to POST PSC Verification for transactionId="${TRANSACTION_ID}"`);
            });

            expect(response).toBeUndefined();
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledWith(TRANSACTION_ID, INITIAL_PSC_DATA, {});
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

        it("should throw an error when the response status is 401 Unauthorized", async () => {
            const mockGet: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.Unauthorized
            };
            mockGetPscVerification.mockResolvedValueOnce(mockGet);
            const expectedMessage = `User not authorized owner for transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`;

            await expect(getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(new HttpError(expectedMessage, HttpStatusCode.NotFound));
        });

        // add a test to check when the response status is undefined then an error is thrown
        it("should throw an error when the response status is undefined", async () => {
            const mockGet: Resource<PscVerification> | ApiErrorResponse = {
                httpStatusCode: undefined
            };
            mockGetPscVerification.mockResolvedValueOnce(mockGet);
            const expectedMessage = `HTTP status code is undefined - Failed to GET PSC Verification for transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`;

            await expect(getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                new Error(expectedMessage)
            );
        });

        it("should throw an error when the response resource is undefined", async () => {
            const mockGet: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: undefined
            };
            mockGetPscVerification.mockResolvedValueOnce(mockGet);

            await expect(getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                new Error(`PSC Verification API GET request returned no resource for transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`));
        });

        it("should throw an Error when no response from API", async () => {
            mockGetPscVerification.mockResolvedValueOnce(undefined);

            await expect(getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                new Error(`PSC Verification GET request returned no response for transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`));
        });

        it("should throw an Error when API status is unavailable", async () => {
            const mockGet: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockGetPscVerification.mockResolvedValueOnce(mockGet);

            await expect(getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                new HttpError(`Failed to GET PSC Verification for transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`, HttpStatusCode.ServiceUnavailable));
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

            const response = await patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA).catch((error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty("message", `PSC Verification PATCH request returned no response for resource with transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw an Error when API status is unknown", async () => {
            mockPatchPscVerification.mockResolvedValueOnce({});

            const response = await patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA).catch((error) => {
                expect(error).toBeInstanceOf(Error);
                expect(error).toHaveProperty("message", `HTTP status code is undefined - Failed to PATCH PSC Verification for resource with transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it.each([400, 404])("should throw a DataIntegrityError when API status is 400/404", async (status) => {
            const mockPatch: Resource<PscVerification> = {
                httpStatusCode: status
            };
            mockPatchPscVerification.mockResolvedValueOnce(mockPatch);

            const response = await patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA).catch((error) => {
                expect(error).toBeInstanceOf(DataIntegrityError);
                expect(error).toHaveProperty("type", "PSC_DATA");
                expect(error).toHaveProperty(
                    "message",
                    `received ${status} - Failed to PATCH PSC Verification for resource with transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}", context: \n{}`
                );
            });
            expect(response).toBeUndefined();
        });

        it.each([400, 404])("should parse API error response text when available & API status is 400/404", async (status) => {
            const errorMessage = "Error message";
            const mockPatch = {
                httpStatusCode: status,
                resource: {
                    errors: [{
                        error: errorMessage
                    }]
                }
            };
            mockPatchPscVerification.mockResolvedValueOnce(mockPatch);

            const response = await patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA).catch((error) => {
                expect(error).toBeInstanceOf(DataIntegrityError);
                expect(error).toHaveProperty("type", "PSC_DATA");
                expect(error).toHaveProperty("message", `received ${status} - ${errorMessage}, context: \n{}`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw a HttpError when an unsuccessful API status is otherwise unhandled", async () => {
            const mockPatch: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockPatchPscVerification.mockResolvedValueOnce(mockPatch);

            const response = await patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA).catch((error) => {
                expect(error).toBeInstanceOf(HttpError);
                expect(error).toHaveProperty("status", HttpStatusCode.ServiceUnavailable);
                expect(error).toHaveProperty("message", `Failed to PATCH PSC Verification for resource with transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`);
            });
            expect(response).toBeUndefined();
        });

        it("should throw an error when the response is empty", async () => {
            const mockPatch: Resource<PscVerification> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: undefined
            };
            mockPatchPscVerification.mockResolvedValueOnce(mockPatch);

            await expect(patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA)).rejects.toThrow(
                new Error(`PSC Verification API PATCH request returned no resource with transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`));

        });
    });

    describe("checkPlannedMaintenance", () => {
        it("should return the Planned Maintenance Response when the API call is successful", async () => {
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
                new Error("PSC Verification GET maintenance request returned no response"));
        });

        it("should throw an Error when API status is unavailable", async () => {
            const mockPlannedMaintenance: ApiResponse<PlannedMaintenance> = {
                httpStatusCode: HttpStatusCode.ServiceUnavailable
            };
            mockCheckPlannedMaintenance.mockResolvedValueOnce(mockPlannedMaintenance);

            await expect(checkPlannedMaintenance(req)).rejects.toThrow(
                new Error("HTTP status code 503 - Failed to GET Planned Maintenance response"));
        });

        it("should throw an error when the API call returns a non-OK HTTP status code", async () => {
            const mockErrorResponse: ApiErrorResponse = {
                httpStatusCode: HttpStatusCode.InternalServerError,
                errors: [{ error: "Internal Server Error" }]
            };
            mockCheckPlannedMaintenance.mockResolvedValue(mockErrorResponse);

            await expect(checkPlannedMaintenance(req)).rejects.toThrow(
                "HTTP status code 500 - Failed to GET Planned Maintenance response"
            );
        });

        it("should throw an error when the API call returns an undefined HTTP status code", async () => {
            const mockErrorResponse: ApiErrorResponse = {
                httpStatusCode: undefined,
                errors: [{ error: "Internal Server Error" }]
            };
            mockCheckPlannedMaintenance.mockResolvedValue(mockErrorResponse);

            await expect(checkPlannedMaintenance(req)).rejects.toThrow(
                "HTTP status code undefined - Failed to GET Planned Maintenance response"
            );
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
            jest.spyOn(logger, "error").mockImplementation(() => { /* No-op */ });

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
                resource: VALIDATION_STATUS_INVALID_NAME
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

            await expect(getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                `Error getting validation status: HTTP response is 404 for transactionId="11111-22222-33333", pscVerificationId="662a0de6a2c6f9aead0f32ab"`
            );

            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);
        });

        it("should throw an error when the response is null", async () => {
            mockGetValidationStatus.mockResolvedValueOnce(null);

            await expect(getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                `PSC Verification GET validation status request did not return a response for transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`
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

            await expect(getValidationStatus(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toThrow(
                `Error getting validation status for transactionId="${TRANSACTION_ID}", pscVerificationId="${PSC_VERIFICATION_ID}"`
            );

            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockGetValidationStatus).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);
        });
    });
});

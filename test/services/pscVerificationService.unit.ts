import { PlannedMaintenance, PscVerification } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createApiKeyClient, createOAuthApiClient } from "../../src/services/apiClientService";
import { checkPlannedMaintenance, createPscVerification, getPscVerification, patchPscVerification } from "../../src/services/pscVerificationService";
import { INDIVIDUAL_VERIFICATION_CREATED, INDIVIDUAL_VERIFICATION_FULL, INDIVIDUAL_VERIFICATION_PATCH, INITIAL_PSC_DATA, PATCH_INDIVIDUAL_DATA, PLANNED_MAINTENANCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { CREATED_PSC_TRANSACTION } from "../mocks/transaction.mock";
import { Resource } from "@companieshouse/api-sdk-node";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockCreatePscVerification = jest.fn();
const mockGetPscVerification = jest.fn();
const mockPatchPscVerification = jest.fn();
const mockCheckPlannedMaintenance = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;
const mockCreateApiKeyClient = createApiKeyClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    pscVerificationService: {
        postPscVerification: mockCreatePscVerification,
        getPscVerification: mockGetPscVerification,
        patchPscVerification: mockPatchPscVerification
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
    });
});

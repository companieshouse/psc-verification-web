import { PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { createPscVerification, getPscVerification, patchPscVerification } from "../../src/services/pscVerificationService";
import { CREATED_RESOURCE, INDIVIDUAL_RESOURCE, INITIAL_DATA, PATCHED_INDIVIDUAL_RESOURCE, PATCH_INDIVIDUAL_DATA, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { CREATED_PSC_TRANSACTION } from "../mocks/transaction.mock";
import { Resource } from "@companieshouse/api-sdk-node";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockCreatePscVerification = jest.fn();
const mockGetPscVerification = jest.fn();
const mockPatchPscVerification = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    pscVerificationService: {
        postPscVerification: mockCreatePscVerification,
        getPscVerification: mockGetPscVerification,
        patchPscVerification: mockPatchPscVerification
    }
});

describe("pscVerificationService", () => {
    const req = {} as Request;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("createPscVerification", () => {
        it("should return the created initial resource on success", async () => {
            const mockCreate: Resource<PscVerificationResource> = {
                httpStatusCode: HttpStatusCode.Created,
                resource: CREATED_RESOURCE
            };
            mockCreatePscVerification.mockResolvedValueOnce(mockCreate);

            const response = await createPscVerification(req, CREATED_PSC_TRANSACTION, INITIAL_DATA);

            expect(response.httpStatusCode).toBe(HttpStatusCode.Created);
            const castedResource = response.resource as PscVerificationResource;
            expect(castedResource).toEqual(CREATED_RESOURCE);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledWith(TRANSACTION_ID, INITIAL_DATA);
        });
    });

    describe("getPscVerification", () => {
        it("should retrieve the resource by its id", async () => {
            const mockGet: Resource<PscVerificationResource> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: INDIVIDUAL_RESOURCE
            };
            mockGetPscVerification.mockResolvedValueOnce(mockGet);

            const response = await getPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID);

            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            const castedResource = response.resource as PscVerificationResource;
            expect(castedResource).toEqual(INDIVIDUAL_RESOURCE);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
            expect(mockGetPscVerification).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID);
        });
    });

    describe("patchPscVerification", () => {
        it("should return the patched resource on success", async () => {
            const mockPatch: Resource<PscVerificationResource> = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: PATCHED_INDIVIDUAL_RESOURCE
            };
            mockPatchPscVerification.mockResolvedValueOnce(mockPatch);

            const response = await patchPscVerification(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA);

            expect(response.httpStatusCode).toBe(HttpStatusCode.Ok);
            const castedResource = response.resource as PscVerificationResource;
            expect(castedResource).toEqual(PATCHED_INDIVIDUAL_RESOURCE);
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_DATA);
        });
    });
});

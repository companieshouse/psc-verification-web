import { PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Session } from "@companieshouse/node-session-handler";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { createPscVerification } from "../../src/services/pscVerificationService";
import { CREATED_RESOURCE, INITIAL_DATA, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { PSC_TRANSACTION } from "../mocks/transaction.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

let session: Session;
const mockCreatePscVerification = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    pscVerificationService: {
        postPscVerification: mockCreatePscVerification
    }
});

describe("pscVerificationService", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        session = new Session();
    });

    it("createPscVerification should return created resource on success", async () => {
        const mockResponse: ApiResponse<PscVerificationResource> = {
            httpStatusCode: HttpStatusCode.Created,
            resource: CREATED_RESOURCE
        };
        mockCreatePscVerification.mockResolvedValueOnce(mockResponse as ApiResponse<PscVerificationResource>);
        const req = {} as Request;

        const response = await createPscVerification(req, PSC_TRANSACTION, INITIAL_DATA);

        expect(response.httpStatusCode).toBe(HttpStatusCode.Created);
        const castedResource = response.resource as PscVerificationResource;
        expect(castedResource).toEqual(CREATED_RESOURCE);
        expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
        expect(mockCreatePscVerification).toHaveBeenCalledTimes(1);
        expect(mockCreatePscVerification).toHaveBeenCalledWith(TRANSACTION_ID, INITIAL_DATA);
    });
});

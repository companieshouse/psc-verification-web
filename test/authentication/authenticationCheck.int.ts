import middlewareMocks from "../mocks/allMiddleware.mock";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { PscVerification } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import request from "supertest";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { INDIVIDUAL_VERIFICATION_CREATED } from "../mocks/pscVerification.mock";
import { getTransaction } from "../../src/services/transactionService";
import { OPEN_PSC_TRANSACTION } from "../mocks/transaction.mock";

jest.mock("../../src/services/companyProfileService");
jest.mock("../../src/services/apiClientService");

const mockCreatePscVerification = jest.fn();
const mockGetPscVerification = jest.fn();
const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;

mockCreateOAuthApiClient.mockReturnValue({
    pscVerificationService: {
        postPscVerification: mockCreatePscVerification,
        getPscVerification: mockGetPscVerification
    }
});
const mockCreate: Resource<PscVerification> = {
    httpStatusCode: HttpStatusCode.Created,
    resource: INDIVIDUAL_VERIFICATION_CREATED
};
const mockGet: Resource<PscVerification> = {
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_VERIFICATION_CREATED
};
mockCreatePscVerification.mockResolvedValueOnce(mockCreate);
mockGetPscVerification.mockResolvedValueOnce(mockGet);

jest.mock("../../src/services/transactionService");
const mockGetTransaction = getTransaction as jest.Mock;
mockGetTransaction.mockResolvedValue(OPEN_PSC_TRANSACTION);

describe("Authentication checked on all pages except for the start page", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it(`Should not authenticate when navigating to '${PrefixedUrls.START}'`, async () => {
        const resp = await request(app).get(PrefixedUrls.START);

        expect(middlewareMocks.mockAuthenticationMiddleware).not.toHaveBeenCalled();
    });

    it.each([PrefixedUrls.CONFIRM_COMPANY,
        PrefixedUrls.INDIVIDUAL_PSC_LIST,
        PrefixedUrls.PERSONAL_CODE,
        PrefixedUrls.NAME_MISMATCH,
        PrefixedUrls.INDIVIDUAL_STATEMENT,
        PrefixedUrls.PSC_VERIFIED])("Should authenticate when navigating to '%s'", async (url) => {

        const resp = await request(app).get(url);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

});

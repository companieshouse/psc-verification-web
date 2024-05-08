import middlewareMocks from "../mocks/allMiddleware.mock";
import app from ".../../../src/app";
import { PrefixedUrls } from ".../../../src/constants";
import { PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import request from "supertest";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { CREATED_RESOURCE, INDIVIDUAL_RESOURCE } from "../mocks/pscVerification.mock";

jest.mock(".../../../src/services/companyProfileService");
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
const mockCreate: Resource<PscVerificationResource> = {
    httpStatusCode: HttpStatusCode.Created,
    resource: CREATED_RESOURCE
};
const mockGet: Resource<PscVerificationResource> = {
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_RESOURCE
};
mockCreatePscVerification.mockResolvedValueOnce(mockCreate);
mockGetPscVerification.mockResolvedValueOnce(mockGet);

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

    // TODO -  Add tests for the RLE journey pages
    it.each([PrefixedUrls.CONFIRM_COMPANY,
        PrefixedUrls.PSC_TYPE,
        PrefixedUrls.INDIVIDUAL_PSC_LIST,
        PrefixedUrls.INDIVIDUAL_STATEMENT,
        PrefixedUrls.PSC_VERIFIED])("Should authenticate when navigating to '%s'", async (url) => {

        const resp = await request(app).get(url);

        expect(middlewareMocks.mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

});

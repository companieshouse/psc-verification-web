import request from "supertest";
import { HttpStatusCode } from "axios";
import { PrefixedUrls } from ".../../../src/constants";
import mockCsrfProtectionMiddleware from "../mocks/csrfProtectionMiddleware.mock";
import { PscVerification } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_CREATED, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import app from ".../../../src/app";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";

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

describe("CSRF violation handling", () => {
    beforeAll(() => {
        mockCsrfProtectionMiddleware.mockClear();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip.each([PrefixedUrls.CONFIRM_COMPANY,
        PrefixedUrls.PSC_TYPE,
        PrefixedUrls.INDIVIDUAL_PSC_LIST,
        PrefixedUrls.INDIVIDUAL_STATEMENT,
        PrefixedUrls.PERSONAL_CODE])("Should fail missing CSRF token when posting to '%s'", async (url) => {

        const queryParams = new URLSearchParams(`companyNumber=${COMPANY_NUMBER}&lang=en`);
        const uriWithQuery = `${url}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);
        const data = { lang: "en", companyNumber: `${COMPANY_NUMBER}` };

        const response = await request(app)
            .post(uri)
            .send(data)
            .set("Content-Type", "application/json")
            .set("Accept", "application/json");

        expect(response.status).toEqual(403);
        expect(response.text).toContain("Sorry, the service can not be accessed");
    });

});

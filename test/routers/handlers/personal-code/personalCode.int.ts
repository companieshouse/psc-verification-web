import { HttpStatusCode } from "axios";
import request from "supertest";
import * as cheerio from "cheerio";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_RESOURCE, PATCH_INDIVIDUAL_DATA, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { getPscVerification, patchPscVerification } from "../../../../src/services/pscVerificationService";
import app from "../../../../src/app";
import { PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { IncomingMessage } from "http";

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;
mockGetPscVerification.mockResolvedValue({
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_RESOURCE
});
const mockPatchPscVerification = patchPscVerification as jest.Mock;

jest.mock("../../../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    })
}));

describe("personal code view", () => {

    beforeEach(() => {
        mockSessionMiddleware.mockClear();
        mockAuthenticationMiddleware.mockClear();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
    });

    it("Should render the Personal code page with a success status code and correct links", async () => {

        const queryParams = new URLSearchParams("lang=en");
        const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const resp = await request(app).get(uri);

        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);

        expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/psc-list?lang=en");
    });

    it("Should redirect to the PSC individual statement page with a redirect status code", async () => {
        const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);
        const verification: PscVerificationData = {
            verificationDetails: {
                uvid: "123abc456edf"
            }
        };
        mockPatchPscVerification.mockResolvedValueOnce({
            HttpStatusCode: HttpStatusCode.Ok,
            resource: {
                ...PATCH_INDIVIDUAL_DATA, ...verification
            }
        });

        const resp = await request(app)
            .post(uri)
            .send({ personalCode: "123abc456edf" });

        expect(resp.status).toBe(HttpStatusCode.Found);
        expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
        expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
        expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
    });
});

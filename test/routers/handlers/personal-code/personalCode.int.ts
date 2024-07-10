import { HttpStatusCode } from "axios";
import request from "supertest";
import * as cheerio from "cheerio";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_VERIFICATION_PATCH, PATCH_INDIVIDUAL_DATA, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { getPscVerification, patchPscVerification } from "../../../../src/services/pscVerificationService";
import app from "../../../../src/app";
import { PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { IncomingMessage } from "http";
import { getPscIndividual } from "../../../../src/services/pscService";

jest.mock("../../../../src/services/pscVerificationService");
jest.mock("../../../../src/services/pscService");

const mockGetPscVerification = getPscVerification as jest.Mock;
const mockPatchPscVerification = patchPscVerification as jest.Mock;
const mockGetPscIndividual = getPscIndividual as jest.Mock;

describe("personal code router/handler integration tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPscVerification.mockResolvedValue({
            httpStatusCode: HttpStatusCode.Ok,
            resource: INDIVIDUAL_VERIFICATION_PATCH
        });

        mockGetPscIndividual.mockResolvedValue({
            httpStatusCode: HttpStatusCode.Ok,
            resource: PSC_INDIVIDUAL
        });
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
    });

    describe("GET method", () => {

        afterEach(() => {
            expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
        });

        it("Should render the Personal Code page with a success status code and the correct links and content", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri).expect(HttpStatusCode.Ok);

            const $ = cheerio.load(resp.text);

            expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/psc-list?lang=en");
        });

        it("Should display 'What is their Companies House personal code?' message on the Personal Code page", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            // WIP
            const $ = cheerio.load(resp.text);
            console.log("Content text for H1 is...");
            console.log($("h1").text());
            expect($("h1").text().trim()).toBe("What is their Companies House personal code?");

        });
    });

    describe("POST method", () => {

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

});

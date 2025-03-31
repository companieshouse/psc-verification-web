import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { URLSearchParams } from "url";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import mockCsrfProtectionMiddleware from "../../../mocks/csrfProtectionMiddleware.mock";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_VERIFICATION_FULL, INDIVIDUAL_VERIFICATION_FULL_NAME_MISMATCH, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { getPscVerification, patchPscVerification } from "../../../../src/services/pscVerificationService";
import app from "../../../../src/app";
import { PscVerificationData, VerificationStatementEnum } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { IncomingMessage } from "http";

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;
const mockPatchPscVerification = patchPscVerification as jest.Mock;

jest.mock("../../../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    })
}));

describe("individual statement router/handler integration tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockSessionMiddleware.mockClear();
        mockAuthenticationMiddleware.mockClear();
        mockCsrfProtectionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    describe("GET method", () => {

        it.each(["en", "cy"])(`Should render the Individual Statement page with a success status code, correct (%s) links, and correct statement selected`, async (lang) => {
            mockGetPscVerification.mockResolvedValue({
                httpStatusCode: HttpStatusCode.Ok,
                resource: INDIVIDUAL_VERIFICATION_FULL
            });

            const queryParams = new URLSearchParams(`lang=${lang}`);
            const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_STATEMENT}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);

            expect(resp.status).toBe(HttpStatusCode.Ok);
            expect($("a.govuk-back-link").attr("href")).toBe(`/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/personal-code?lang=${lang}&selectedPscId=123456`);
            if (lang === "en") {
                expect($("div#nameAndDateOfBirth").text()).toBe("Sir Forename Middlename Surname (Born April 2000)");
                // expect emphasis applied to PSC name
                expect(normalizeWhitespace($("label.govuk-checkboxes__label[for='pscIndividualStatement']").html())).toBe("I confirm that <strong>Sir Forename Middlename Surname</strong> has verified their identity in accordance with the Companies Act 2006.");
            }

            expect($("input.govuk-checkboxes__input[name=pscIndividualStatement]").prop("checked")).toBe(true);
        });

        it.each(["en", "cy"])(`Should render the Individual Statement page with a success status code, correct (%s) links, and correct statement selected when there is a name mismatch`, async (lang) => {
            mockGetPscVerification.mockResolvedValue({
                httpStatusCode: HttpStatusCode.Ok,
                resource: INDIVIDUAL_VERIFICATION_FULL_NAME_MISMATCH
            });

            const queryParams = new URLSearchParams(`lang=${lang}`);
            const uriWithQuery = `${PrefixedUrls.INDIVIDUAL_STATEMENT}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);

            expect(resp.status).toBe(HttpStatusCode.Ok);
            expect($("a.govuk-back-link").attr("href")).toBe(`/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/psc-why-this-name?lang=${lang}&selectedPscId=123456`);
            if (lang === "en") {
                expect($("div#nameAndDateOfBirth").text()).toBe("Sir Forename Middlename Surname (Born April 2000)");
                // expect emphasis applied to PSC name
                expect(normalizeWhitespace($("label.govuk-checkboxes__label[for='pscIndividualStatement']").html())).toBe("I confirm that <strong>Sir Forename Middlename Surname</strong> has verified their identity in accordance with the Companies Act 2006.");
            }

            expect($("input.govuk-checkboxes__input[name=pscIndividualStatement]").prop("checked")).toBe(true);
        });

    });

    describe("POST method", () => {

        it("Should redirect to the PSC verified page with a redirect status code", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
                }
            };
            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...INDIVIDUAL_VERIFICATION_FULL, ...verification
                }
            });

            const resp = await request(app)
                .post(uri)
                .send({ pscIndividualStatement: VerificationStatementEnum.INDIVIDUAL_VERIFIED });

            expect(resp.status).toBe(HttpStatusCode.Found);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
            expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
        });
    });
});

const normalizeWhitespace = (html: string | null): string | null => html?.replace(/[\r\n\t]+/gm, "").replace(/\s+/g, " ").trim() || null;

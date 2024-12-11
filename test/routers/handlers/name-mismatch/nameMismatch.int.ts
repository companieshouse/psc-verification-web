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
import { IND_VERIFICATION_NAME_MISMATCH, PATCHED_NAME_MISMATCH_DATA, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { getPscVerification, patchPscVerification } from "../../../../src/services/pscVerificationService";
import app from "../../../../src/app";
import { PscVerificationData, VerificationStatementEnum } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { IncomingMessage } from "http";
import { getPscIndividual } from "../../../../src/services/pscService";

jest.mock("../../../../src/services/pscVerificationService");
jest.mock("../../../../src/services/pscService");

const mockGetPscVerification = getPscVerification as jest.Mock;
const mockPatchPscVerification = patchPscVerification as jest.Mock;
const mockGetPscIndividual = getPscIndividual as jest.Mock;

describe("name mismatch router/handler integration tests", () => {

    beforeAll(() => {
        mockCsrfProtectionMiddleware.mockClear();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPscVerification.mockResolvedValue({
            httpStatusCode: HttpStatusCode.Ok,
            resource: IND_VERIFICATION_NAME_MISMATCH
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

        it.each(["en", "cy"])(`Should render the Name Mismatch page with a success status code, correct (%s) links and content`, async (lang) => {
            const queryParams = new URLSearchParams(`lang=${lang}`);
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);

            expect(resp.status).toBe(HttpStatusCode.Ok);
            expect($("a.govuk-back-link").attr("href")).toBe(`/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/personal-code?lang=${lang}`);
            if (lang === "en") {
                expect($("span").text()).toContain("Sir Forename Middlename Surname (Born April 2000)");
            } else if (lang === "cy") {
                expect($("span").text()).toContain("Sir Forename Middlename Surname (to be translated Ebrill 2000)");
            }
        });

        it("Should display 'Why is the name on the public register different to the name this PSC used for identity verification?' message on the Name Mismatch page", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("h1").text().trim()).toBe("Why is the name on the public register different to the name this PSC used for identity verification?");
        });

        it("Should display a link to the 'file-changes-to-a-company-with-companies-house' page", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);

            const link = $("a.govuk-link[href=\"https://www.gov.uk/file-changes-to-a-company-with-companies-house\"]");
            expect(link.length).toBe(1);
            expect(link.attr("rel")).toBe("noreferrer noopener");
            expect(link.attr("target")).toBe("_blank");
        });

        it("should display the correct radio buttons", async () => {
            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);

            const radioButtons = [
                { value: "LEGAL_NAME_CHANGE", text: "Legally changed name (for example, marriage or divorce)", eventId: "legally-changed-radio-option" },
                { value: "PREFERRED_NAME", text: "Preferred name", eventId: "preferred-name-radio-option" },
                { value: "DIFFERENT_NAMING_CONVENTION", text: "Translation or a different naming convention", eventId: "translation-or-different-naming-convention-radio-option" },
                { value: "PUBLIC_REGISTER_ERROR", text: "Error on the public register", eventId: "register-incorrect-radio-option" },
                { value: "PREFER_NOT_TO_SAY", text: "Prefer not to say", eventId: "prefer-not-to-say-radio-option" }
            ];

            radioButtons.forEach(radio => {
                const radioButton = $(`input[type="radio"][value="${radio.value}"]`);
                expect(radioButton.length).toBe(1);
                expect(radioButton.attr("data-event-id")).toBe(radio.eventId);
                expect(radioButton.next("label").text()).toContain(radio.text);
            });
        });

        test.each([
            "LEGAL_NAME_CHANGE",
            "PREFERRED_NAME",
            "DIFFERENT_NAMING_CONVENTION",
            "PUBLIC_REGISTER_ERROR",
            "PREFER_NOT_TO_SAY"
        ])("should have the selected radio button checked for %s", async (nameMismatch) => {
            const queryParams = new URLSearchParams(`nameMismatch=${nameMismatch}&lang=en`);
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);
            const $ = cheerio.load(resp.text);

            const selectedRadioButton = $(`input[type="radio"][value="${nameMismatch}"]`);
            expect(selectedRadioButton.length).toBe(1);
            expect(selectedRadioButton.attr("checked")).toBe("checked");
        });

        it("Should display a 'Continue' button", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("button#submit").text()).toContain("Continue");
        });

    });

    describe("POST method", () => {

        it("Should redirect to the PSC individual statement page with a redirect status code", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
                }
            };
            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...IND_VERIFICATION_NAME_MISMATCH, ...verification
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

        it("Should handle errors and return the correct view data with errors", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.NAME_MISMATCH, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    uvid: ""
                }
            };

            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...PATCHED_NAME_MISMATCH_DATA, ...verification
                }
            });

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: "" });

            const $ = cheerio.load(resp.text);

            expect(mockPatchPscVerification).toHaveBeenCalledTimes(0);
            // Note is a validation error
            expect(resp.status).toBe(HttpStatusCode.Ok);
        });

    });

});
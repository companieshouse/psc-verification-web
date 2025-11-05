import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { URLSearchParams } from "url";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import mockCsrfProtectionMiddleware from "../../../mocks/csrfProtectionMiddleware.mock";
import { CommonDataEventIds, PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { IND_VERIFICATION_NAME_MISMATCH_DEFINED, IND_VERIFICATION_PERSONAL_CODE_DEFINED, PSC_VERIFICATION_ID, TRANSACTION_ID, UVID } from "../../../mocks/pscVerification.mock";
import { getPscVerification, patchPscVerification } from "../../../../src/services/pscVerificationService";
import app from "../../../../src/app";
import { NameMismatchReasonEnum, PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { IncomingMessage } from "http";
import { getPscIndividual } from "../../../../src/services/pscService";
import { getTransaction } from "../../../../src/services/transactionService";
import { OPEN_PSC_TRANSACTION } from "../../../mocks/transaction.mock";

jest.mock("../../../../src/services/pscVerificationService");
jest.mock("../../../../src/services/pscService");

const mockGetPscVerification = getPscVerification as jest.Mock;
const mockPatchPscVerification = patchPscVerification as jest.Mock;
const mockGetPscIndividual = getPscIndividual as jest.Mock;

jest.mock("../../../../src/services/transactionService");
const mockGetTransaction = getTransaction as jest.Mock;
mockGetTransaction.mockResolvedValue(OPEN_PSC_TRANSACTION);

describe("name mismatch router/handler integration tests", () => {

    beforeAll(() => {
        mockCsrfProtectionMiddleware.mockClear();
    });

    beforeEach(() => {
        jest.clearAllMocks();

        mockGetPscIndividual.mockResolvedValue({
            httpStatusCode: HttpStatusCode.Ok,
            resource: PSC_INDIVIDUAL
        });

        mockGetPscVerification.mockResolvedValue({
            httpStatusCode: HttpStatusCode.Ok,
            resource: IND_VERIFICATION_PERSONAL_CODE_DEFINED
        });
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
    });

    describe("GET method", () => {

        beforeEach(() => {
            mockGetPscVerification.mockResolvedValue({
                httpStatusCode: HttpStatusCode.Ok,
                resource: IND_VERIFICATION_NAME_MISMATCH_DEFINED
            });
        });

        afterEach(() => {
            expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
        });

        it("Should render the Name Mismatch page with a success status code and the correct links and content", async () => {

            const queryParams = new URLSearchParams("lang=en");
            queryParams.set("uvid", UVID);

            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri).expect(HttpStatusCode.Ok);

            const $ = cheerio.load(resp.text);

            expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/personal-code?lang=en");
        });

        it(`Should render the Name Mismatch page with a success status code, correct (%s) links and content`, async () => {
            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);

            expect(resp.status).toBe(HttpStatusCode.Ok);
            expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/personal-code?lang=en");
            expect($("span").text()).toContain("Sir Forename Middlename Surname (Born April 2000)");
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
                { value: "LEGALLY_CHANGED", text: "Legally changed name (for example, marriage or divorce)", eventId: "legally-changed-radio-option" },
                { value: "PREFERRED_NAME", text: "Preferred name", eventId: "preferred-name-radio-option" },
                { value: "TRANSLATION_OR_DIFF_CONV", text: "Translation or a different naming convention", eventId: "translation-or-different-naming-convention-radio-option" },
                { value: "REGISTER_ERROR", text: "Error on the public register", eventId: "register-incorrect-radio-option" },
                { value: "NOT_SAY", text: "Prefer not to say", eventId: "prefer-not-to-say-radio-option" }
            ];

            const renderedRadios = $("input[type=\"radio\"]");
            expect(renderedRadios.length).toBe(5);

            radioButtons.forEach((radio: { value: string; eventId: string; text: string }) => {
                const radioButton = $(`input[type="radio"][value="${radio.value}"]`);
                expect(radioButton.length).toBe(1);
                expect(radioButton.attr("data-event-id")).toBe(radio.eventId);
                expect(radioButton.next("label").text()).toContain(radio.text);
            });
        });

        it("should have the selected radio button as checked if a name mismatch reason is already submitted for %s", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);
            const $ = cheerio.load(resp.text);

            const selectedRadioButton = $("input[type=\"radio\"][checked]");
            expect(selectedRadioButton.length).toBe(1);
            expect(selectedRadioButton.attr("checked")).toBe("checked");
            expect(selectedRadioButton.attr("value")).not.toBeNull();
        });

        it("Should display a 'Continue' button", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.NAME_MISMATCH}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("button#submit").text()).toContain("Continue");
            expect($("button#submit").length).toBe(1);
            expect($("button#submit").attr("data-event-id")).toBe(CommonDataEventIds.CONTINUE_BUTTON);
            expect($("button#submit").text().trim()).toBe("Continue");

        });

    });

    describe("POST method", () => {

        beforeEach(() => {
            mockGetPscVerification.mockResolvedValue({
                httpStatusCode: HttpStatusCode.Ok,
                resource: IND_VERIFICATION_NAME_MISMATCH_DEFINED
            });
        });

        afterEach(() => {
            expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
        });

        it("Should redirect to the PSC individual statement page with a redirect status code", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.NAME_MISMATCH, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    nameMismatchReason: NameMismatchReasonEnum.NOT_TO_SAY
                }
            };

            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...IND_VERIFICATION_NAME_MISMATCH_DEFINED, ...verification
                }
            });

            const resp = await request(app)
                .post(uri)
                .send({ nameMismatch: NameMismatchReasonEnum.NOT_TO_SAY });

            expect(resp.status).toBe(HttpStatusCode.Found);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
            expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
        });

        it("Should display the name mismatch page with the validation errors when no reason is selected", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.NAME_MISMATCH, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app)
                .post(uri)
                .send({ });

            const $ = cheerio.load(resp.text);

            expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(0);
            // Note is a validation error
            expect(resp.status).toBe(HttpStatusCode.Ok);

            // error summary
            const errorText = "Tell us why the name on the public register is different to the name this PSC used for identity verification";
            const errorSummaryHeading = $("h2.govuk-error-summary__title").text().trim();
            expect(errorSummaryHeading).toContain("There is a problem");

            const errorSummaryText = $("ul.govuk-error-summary__list > li > a").text().trim();
            expect(errorSummaryText).toContain(errorText);

            // main body
            const paragraphText = $("#nameMismatch-error").text().trim();
            expect(paragraphText).toContain(errorText);

        });
    });

});

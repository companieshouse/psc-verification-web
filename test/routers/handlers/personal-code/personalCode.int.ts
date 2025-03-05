import { HttpStatusCode } from "axios";
import request from "supertest";
import * as cheerio from "cheerio";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import mockCsrfProtectionMiddleware from "../../../mocks/csrfProtectionMiddleware.mock";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_VERIFICATION_PATCH, PATCH_INDIVIDUAL_DATA, PATCH_RESP_WITH_NAME_MISMATCH, PSC_APPOINTMENT_ID, PSC_VERIFICATION_ID, TRANSACTION_ID, UVID, VALIDATION_STATUS_INVALID_DOB, VALIDATION_STATUS_INVALID_DOB_NAME, VALIDATION_STATUS_INVALID_NAME, VALIDATION_STATUS_INVALID_UVID, VALIDATION_STATUS_RESP_VALID, mockOutOfServiceResponse } from "../../../mocks/pscVerification.mock";
import { getPscVerification, getValidationStatus, patchPscVerification } from "../../../../src/services/pscVerificationService";
import app from "../../../../src/app";
import { PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { IncomingMessage } from "http";
import { getPscIndividual } from "../../../../src/services/pscService";
import { PrefixedUrls, STOP_TYPE } from "../../../../src/constants";
import { getLocalesService } from "../../../../src/utils/localise";

jest.mock("../../../../src/services/pscVerificationService");
jest.mock("../../../../src/services/pscService");

const mockGetPscVerification = getPscVerification as jest.Mock;
const mockPatchPscVerification = patchPscVerification as jest.Mock;
const mockGetPscIndividual = getPscIndividual as jest.Mock;

describe("personal code router/handler integration tests", () => {
    beforeAll(() => {
        mockCsrfProtectionMiddleware.mockClear();
    });

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
            queryParams.set("selectedPscId", PSC_APPOINTMENT_ID);

            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri).expect(HttpStatusCode.Ok);
            console.log(resp);

            const $ = cheerio.load(resp.text);

            expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/individual/psc-list?companyNumber=12345678&lang=en");
        });

        it("Should display the PSC individual's name and DOB on the Personal Code page", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("span").text()).toContain("Sir Forename Middlename Surname (Born April 2000)");

        });

        it("Should display 'What is their Companies House personal code?' message on the Personal Code page", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("h1").text().trim()).toBe("What is their Companies House personal code?");

        });

        it("Should display an input box for the user to enter their personal code", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("#personalCode").length > 0);

        });

        it("Should display an input box for the user to enter their personal code", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("#personalCode").length > 0);

        });

        it("Should display a drop down with further information about the CH personal code", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("details").text()).toContain("Where to find the Companies House personal code");
            expect($("details").text()).toContain("This is an 11 character code that is given to a person after they have verified their identity with Companies House.");

        });

        it("Should display a 'Continue' button", async () => {

            const queryParams = new URLSearchParams("lang=en");
            const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);
            expect($("button#submit").text()).toContain("Save and continue");

        });

    });

    describe("POST method", () => {
        const mockGetValidationStatus = getValidationStatus as jest.Mock;

        it("Should redirect to the PSC individual statement page when the validation status is valid with a redirect status code", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    uvid: UVID
                }
            };

            mockGetValidationStatus.mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALIDATION_STATUS_RESP_VALID
            });

            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...PATCH_INDIVIDUAL_DATA, ...verification
                }
            });

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: UVID });

            expect(resp.status).toBe(HttpStatusCode.Found);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
            expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
        });

        it("Should redirect to the name mismatch page when the validation status is valid and a name mismatch reason exists", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    uvid: UVID
                }
            };

            mockGetValidationStatus.mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALIDATION_STATUS_RESP_VALID
            });

            mockPatchPscVerification.mockResolvedValueOnce(PATCH_RESP_WITH_NAME_MISMATCH);

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: UVID });

            expect(resp.status).toBe(HttpStatusCode.Found);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
            expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.NAME_MISMATCH, TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
        });

        it("Should redirect to the name mismatch page when when the validation status is valid and there is a name mismatch", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    uvid: UVID
                }
            };

            mockGetValidationStatus.mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALIDATION_STATUS_INVALID_NAME
            });

            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...PATCH_INDIVIDUAL_DATA, ...verification
                }
            });

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: UVID });

            expect(resp.status).toBe(HttpStatusCode.Found);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
            expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.NAME_MISMATCH, TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
        });

        it("Should redirect to the DOB stop page with a redirect status code when there is a DOB mismatch", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    uvid: UVID
                }
            };

            mockGetValidationStatus.mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALIDATION_STATUS_INVALID_DOB
            });

            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...PATCH_INDIVIDUAL_DATA, ...verification
                }
            });

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: UVID });

            expect(resp.status).toBe(HttpStatusCode.Found);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
            expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(getUrlWithStopType(PrefixedUrls.STOP_SCREEN_SUBMISSION, STOP_TYPE.PSC_DOB_MISMATCH), TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
        });

        it("Should redirect to the DOB stop page with a redirect status code when there is a UVID/personal code error", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    uvid: UVID
                }
            };

            mockGetValidationStatus.mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALIDATION_STATUS_INVALID_UVID
            });

            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...PATCH_INDIVIDUAL_DATA, ...verification
                }
            });

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: UVID });

            expect(resp.status).toBe(HttpStatusCode.Found);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
            expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(getUrlWithStopType(PrefixedUrls.STOP_SCREEN_SUBMISSION, STOP_TYPE.PSC_DOB_MISMATCH), TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
        });

        it("Should redirect to the DOB stop page with a redirect status code when DOB and name validation errors occur", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const verification: PscVerificationData = {
                verificationDetails: {
                    uvid: UVID
                }
            };

            mockGetValidationStatus.mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Ok,
                resource: VALIDATION_STATUS_INVALID_DOB_NAME
            });

            mockPatchPscVerification.mockResolvedValueOnce({
                HttpStatusCode: HttpStatusCode.Ok,
                resource: {
                    ...PATCH_INDIVIDUAL_DATA, ...verification
                }
            });

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: UVID });

            expect(resp.status).toBe(HttpStatusCode.Found);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledWith(expect.any(IncomingMessage), TRANSACTION_ID, PSC_VERIFICATION_ID, verification);
            expect(resp.header.location).toBe(`${getUrlWithTransactionIdAndSubmissionId(getUrlWithStopType(PrefixedUrls.STOP_SCREEN_SUBMISSION, STOP_TYPE.PSC_DOB_MISMATCH), TRANSACTION_ID, PSC_VERIFICATION_ID)}?lang=en`);
        });

        it("Should handle errors and return the correct view data with errors when no personal code is entered", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: "" });

            const $ = cheerio.load(resp.text);

            expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(0);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(0);
            // Note is a validation error
            expect(resp.status).toBe(HttpStatusCode.Ok);

            // error summary
            const errorText = "Enter a Companies House personal code";
            const errorSummaryHeading = $("h2.govuk-error-summary__title").text().trim();
            expect(errorSummaryHeading).toContain("There is a problem");

            const errorSummaryText = $("ul.govuk-error-summary__list > li > a").text().trim();
            expect(errorSummaryText).toContain(errorText);

            // main body
            const paragraphText = $("#personalCode-error").text().trim();
            expect(paragraphText).toContain(errorText);
        });

        it("Should redirect to the internal server error page when a server error response occurs", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID);
            const localesService = getLocalesService();

            mockGetPscVerification.mockResolvedValueOnce(mockOutOfServiceResponse);
            mockPatchPscVerification.mockResolvedValueOnce(mockOutOfServiceResponse);

            const resp = await request(app)
                .post(uri)
                .send({ personalCode: UVID });

            const $ = cheerio.load(resp.text);
            console.log($);

            expect(resp.status).toBe(HttpStatusCode.InternalServerError);
            expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
            expect(mockPatchPscVerification).toHaveBeenCalledTimes(0);
            expect(mockGetValidationStatus).toHaveBeenCalledTimes(0);
            expect($("h1.govuk-heading-l").text()).toContain(localesService.i18nCh.resolveSingleKey("500_main_title", "en"));
        });
    });

});

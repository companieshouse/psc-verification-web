import * as cheerio from "cheerio";
import { HttpStatusCode } from "axios";
import mockAuthenticationMiddleware from "../mocks/authenticationMiddleware.mock";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockCsrfProtectionMiddleware from "../mocks/csrfProtectionMiddleware.mock";
import { PrefixedUrls } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_CREATED, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";
import { getPscVerification } from "../../src/services/pscVerificationService";

jest.mock("../../src/services/pscVerificationService");

const mockGetPscVerification = getPscVerification as jest.Mock;

describe("PscType router/handler integration tests", () => {
    beforeAll(() => {
        mockCsrfProtectionMiddleware.mockClear();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPscVerification.mockResolvedValueOnce({
            httpStatusCode: HttpStatusCode.Ok,
            resource: INDIVIDUAL_VERIFICATION_CREATED
        });
    });

    afterEach(() => {
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockGetPscVerification).toHaveBeenCalledTimes(1);
    });

    describe("GET method", () => {

        it("Should render the PSC Type page with a successful status code and back-link", async () => {
            const uri = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri)
                .expect(HttpStatusCode.Ok);

            const $ = cheerio.load(resp.text);
            expect($("a.govuk-back-link").attr("href")).toBe(`/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en&pscType=undefined`);
        });

        it.each([["no", undefined], ["PSC", "individual"], ["RLE", "rle"]])("Should render '%s' radio button checked when 'pscType=%s'", async (expectedButton, pscType) => {
            const queryParams = new URLSearchParams();
            queryParams.set("lang", "en");
            if (pscType) {
                queryParams.set("pscType", pscType);
            }
            const uriWithQuery = `${PrefixedUrls.PSC_TYPE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri)
                .expect(HttpStatusCode.Ok);

            const $ = cheerio.load(resp.text);
            expect($("input[name=pscType]:checked").val()).toBe(pscType);
        });
    });

    describe("POST method", () => {

        it.each([["individual", PrefixedUrls.INDIVIDUAL_PSC_LIST], ["rle", PrefixedUrls.RLE_LIST]])(
            "Should redirect the post request to %s list page if selected",
            async (selectedType, expectedPage) => {

                const expectedRedirectUrl = `${expectedPage.replace(":transactionId", TRANSACTION_ID).replace(":submissionId", PSC_VERIFICATION_ID)}?companyNumber=${COMPANY_NUMBER}&lang=en&pscType=${selectedType}`;

                await request(app)
                    .post(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, TRANSACTION_ID, PSC_VERIFICATION_ID))
                    .send({ pscType: selectedType })
                    .set({ "Content-Type": "application/json" })
                    // if present in the request the "companyNumber" query param is passed on to the redirect URL
                    .query({ companyNumber: COMPANY_NUMBER, lang: "en", pscType: selectedType })
                    .expect(HttpStatusCode.Found)
                    .expect("Location", expectedRedirectUrl);
            }
        );

        it("Should render same page with errors in pscType not selected",
            async () => {
                const expectedPageUrl = `${PrefixedUrls.PSC_TYPE.replace(":transactionId", TRANSACTION_ID).replace(":submissionId", PSC_VERIFICATION_ID)}?companyNumber=${COMPANY_NUMBER}&lang=en&pscType=undefined`;

                const posted = await request(app)
                    .post(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, TRANSACTION_ID, PSC_VERIFICATION_ID))
                    .send({ pscType: undefined })
                    .set({ "Content-Type": "application/json" })
                    // if present in the request the "companyNumber" query param is passed on to the redirect URL
                    .query({ companyNumber: COMPANY_NUMBER, lang: "en", pscType: undefined })
                    .expect(HttpStatusCode.Ok);

                const $ = cheerio.load(posted.text);

                expect($("div.govuk-form-group--error")).toBeDefined();
                expect($("a[href='#err-id-pscType']").text()).toBe("Select if you're providing verification details for a PSC or RLE");
            }
        );
    });

});

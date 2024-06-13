import * as cheerio from "cheerio";
import middlewareMocks from "../mocks/allMiddleware.mock";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";
import app from "../../src/app";
import { COMPANY_NUMBER, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { HttpStatusCode } from "axios";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("psc type router tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    describe("Test router.get", () => {

        it("Should render the PSC Type page with a successful status code", async () => {
            const resp = await request(app).get(PrefixedUrls.PSC_TYPE);
            expect(resp.status).toBe(200);
        });

        it.each([[undefined, undefined], ["individual", "pscType=individual"], ["rle", "pscType=rle"]])("Should render the Psc Type page with a success status code and %s radio button checked", async (expectedSelection, expectedQuery) => {
            const queryParams = new URLSearchParams(expectedQuery);
            const uriWithQuery = `${PrefixedUrls.PSC_TYPE}?${queryParams}`;
            const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await request(app).get(uri);

            const $ = cheerio.load(resp.text);

            expect(resp.status).toBe(HttpStatusCode.Ok);
            expect($("input[name=pscType]:checked").val()).toBe(expectedSelection);
        });
    });

    describe("Test router.post", () => {

        it.each([["individual", PrefixedUrls.INDIVIDUAL_PSC_LIST], ["rle", PrefixedUrls.RLE_LIST], ["default", PrefixedUrls.INDIVIDUAL_PSC_LIST]])(
            "Should redirect the post request to %s list page if selected",
            async (selectedType, expectedPage) => {

                const expectedRedirectUrl = `${expectedPage.replace(":transactionId", TRANSACTION_ID).replace(":submissionId", PSC_VERIFICATION_ID)}?companyNumber=${COMPANY_NUMBER}&lang=en&pscType=${selectedType}`;

                await request(app)
                    .post(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, TRANSACTION_ID, PSC_VERIFICATION_ID))
                    .send({ pscType: selectedType })
                    .set({ "Content-Type": "application/json" })
                    .query({ companyNumber: COMPANY_NUMBER, lang: "en", pscType: selectedType })
                    .expect(HttpStatusCode.Found)
                    .expect("Location", expectedRedirectUrl);
            }
        );
    });
});

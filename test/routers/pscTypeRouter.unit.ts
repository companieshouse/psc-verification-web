import middlewareMocks from "./../mocks/allMiddleware.mock";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";
import app from "./../../src/app";
import { FILING_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { HttpStatusCode } from "axios";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("psc type tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the PSC Type page with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.PSC_TYPE);
        expect(resp.status).toBe(200);
    });

    it.each([["individual", PrefixedUrls.INDIVIDUAL_PSC_LIST], ["rle", PrefixedUrls.RLE_LIST], ["default", PrefixedUrls.INDIVIDUAL_PSC_LIST]])(
        "Should redirect to %s list page if selected",
        async (selectedType, expectedPage) => {

            const expectedRedirectUrl = `${expectedPage.replace(":transactionId", TRANSACTION_ID).replace(":submissionId", FILING_ID)}?lang=en`;

            await request(app)
                .post(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, TRANSACTION_ID, FILING_ID))
                .send({ pscType: selectedType })
                .set({ "Content-Type": "application/json" })
                .query({ companyNumber: "123456" })
                .expect(HttpStatusCode.Found)
                .expect("Location", expectedRedirectUrl);
        }
    );
});

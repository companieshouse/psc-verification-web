import middlewareMocks from "../mocks/allMiddleware.mock";
import request from "supertest";
import { PrefixedUrls } from "../../src/constants";
import app from "../../src/app";
import { COMPANY_NUMBER, CREATED_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { HttpStatusCode } from "axios";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";
import { getPscVerification } from "../../src/services/pscVerificationService";

jest.mock("../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: CREATED_RESOURCE
    })
}));

const mockGetPscVerification = getPscVerification as jest.Mock;

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

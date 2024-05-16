import middlewareMocks from "./../mocks/allMiddleware.mock";
import { HttpStatusCode } from "axios";
import { parse } from "node-html-parser";
import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { COMPANY_NUMBER, CREATED_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { getPscVerification } from "../../src/services/pscVerificationService";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";
import { PSC_INDIVIDUAL } from "../mocks/psc.mock";

jest.mock("../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: CREATED_RESOURCE
    })
}));

jest.mock("../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    })
}));
const mockGetPscVerification = getPscVerification as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("personal code router tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the Personal Code page with a success status code and correct links", async () => {
        const queryParams = new URLSearchParams("lang=en");
        const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const resp = await request(app).get(uri);

        const rootNode = parse(resp.text);
        const cssSelector = "a.govuk-back-link";
        const backLink = rootNode.querySelector(cssSelector);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect(backLink?.getAttribute("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/psc-list?lang=en");
    });

    it("Should redirect to Individual Staement sceeen", async () => {
        const expectedRedirectUrl = `${PrefixedUrls.INDIVIDUAL_STATEMENT.replace(":transactionId", TRANSACTION_ID).replace(":submissionId", PSC_VERIFICATION_ID)}?lang=en`;
        await request(app)
            .post(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, PSC_VERIFICATION_ID))
            .send({ pscType: "individual" })
            .set({ "Content-Type": "application/json" })
            .query({ companyNumber: COMPANY_NUMBER, lang: "en", pscType: "individual" })
            .expect(HttpStatusCode.Found)
            .expect("Location", expectedRedirectUrl);
    });

});

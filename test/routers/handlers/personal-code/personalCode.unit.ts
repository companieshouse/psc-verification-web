import middlewareMocks from "./../../../mocks/allMiddleware.mock";
import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import { PrefixedUrls } from "../../../../src/constants";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_PATCH, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { getPscVerification, patchPscVerification } from "../../../../src/services/pscVerificationService";
import { getPscIndividual } from "../../../../src/services/pscService";
import app from "../../../../src/app";

jest.mock("../../../../src/services/pscVerificationService");
jest.mock("../../../../src/services/pscService");

const mockGetPscVerification = getPscVerification as jest.Mock;
const mockPatchPscVerification = patchPscVerification as jest.Mock;
const mockGetPscIndividual = getPscIndividual as jest.Mock;

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

describe("personal code handler tests", () => {

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it.skip("Should render the Personal Code page with a success status code and correct links", async () => {
        const queryParams = new URLSearchParams("lang=en");
        const uriWithQuery = `${PrefixedUrls.PERSONAL_CODE}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

        const resp = await request(app).get(uri);

        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);
        expect($("a.govuk-back-link").attr("href")).toBe("/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab/individual/psc-list?lang=en");
    });

    it("Should redirect to Individual Statement screen", async () => {
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

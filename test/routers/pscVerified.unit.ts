import middlewareMocks from "../mocks/allMiddleware.mock";
import request from "supertest";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { HttpStatusCode } from "axios";
import { PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";

const COMPANY_NUMBER = "99999999";
const COMPANY_NAME = "Test Data LTD";
const PSC_NAME = "Mr Test Testerton";
const PAGE_HEADING = "Identity verification details submitted";

describe("psc verified tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the PSC Verified page with a successful status code", async () => {
        const response = await request(app).get(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, TRANSACTION_ID, PSC_VERIFICATION_ID));
        expect(response.status).toBe(HttpStatusCode.Ok);
    });

    it("Should render the PSC Verified page with the correct company number", async () => {
        const response = await request(app).get(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, TRANSACTION_ID, PSC_VERIFICATION_ID));
        expect(response.text).toContain(COMPANY_NUMBER);
    });

    it("Should render the PSC Verified page with the correct company name", async () => {
        const response = await request(app).get(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, TRANSACTION_ID, PSC_VERIFICATION_ID));
        expect(response.text).toContain(COMPANY_NAME);
    });

    it("Should render the PSC Verified page with the correct psc name", async () => {
        const response = await request(app).get(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, TRANSACTION_ID, PSC_VERIFICATION_ID));
        expect(response.text).toContain(PSC_NAME);
    });

    it("Should render the PSC Verified page with the correct reference number", async () => {
        const response = await request(app).get(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, TRANSACTION_ID, PSC_VERIFICATION_ID));
        expect(response.text).toContain(TRANSACTION_ID);
    });

    it("Should display the correct page heading", async () => {
        const response = await request(app).get(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, TRANSACTION_ID, PSC_VERIFICATION_ID));
        expect(response.text).toContain(PAGE_HEADING);
    });
});

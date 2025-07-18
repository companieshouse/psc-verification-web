import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import mockCsrfProtectionMiddleware from "../../../mocks/csrfProtectionMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls, STOP_TYPE, toStopScreenPrefixedUrl } from "../../../../src/constants";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { closeTransaction, getTransaction } from "../../../../src/services/transactionService";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_VERIFICATION_FULL, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { getPscIndividual } from "../../../../src/services/pscService";
import { env } from "../../../../src/config";
import { OPEN_PSC_TRANSACTION } from "../../../mocks/transaction.mock";

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;
mockGetPscVerification.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_VERIFICATION_FULL
});

jest.mock("../../../../src/services/pscService");
const mockGetPscIndividual = getPscIndividual as jest.Mock;
mockGetPscIndividual.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: PSC_INDIVIDUAL
});

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

jest.mock("../../../../src/services/transactionService");
const mockCloseTransaction = closeTransaction as jest.Mock;
const mockGetTransaction = getTransaction as jest.Mock;
mockCloseTransaction.mockResolvedValue({});
mockGetTransaction.mockResolvedValue(OPEN_PSC_TRANSACTION);

describe("stop screen view tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockCsrfProtectionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it.each(Object.values(STOP_TYPE))("Should render the stop screen '%s' page with a success status code", async (stopType: STOP_TYPE) => {
        const queryParams = new URLSearchParams("companyNumber=00006400&lang=en");
        const uriWithQuery = `${getUrlWithStopType(toStopScreenPrefixedUrl(stopType), stopType)}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);
        const expectedPrefix = "/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab";

        const resp = await request(app).get(uri);
        const $ = cheerio.load(resp.text);
        expect(resp.status).toBe(HttpStatusCode.Ok);

        switch (stopType) {
            case STOP_TYPE.COMPANY_STATUS:
                expect($("a.govuk-back-link").attr("href")).toBe(`${PrefixedUrls.CONFIRM_COMPANY}?lang=en&companyNumber=00006400`);
                expect($("a#go-back-enter-number").attr("href")).toBe(`${PrefixedUrls.COMPANY_NUMBER}?lang=en`);
                expect($("a#contact-us").attr("href")).toBe(env.CONTACT_US_LINK);
                break;
            case STOP_TYPE.COMPANY_TYPE:
                expect($("a.govuk-back-link").attr("href")).toBe(`${PrefixedUrls.CONFIRM_COMPANY}?lang=en&companyNumber=00006400`);
                expect($("a#go-back-enter-number").attr("href")).toBe(`${PrefixedUrls.COMPANY_NUMBER}?lang=en`);
                expect($("a#contact-us").attr("href")).toBe(env.CONTACT_US_LINK);
                expect($("li").text().trim()).toContain("a private limited company");
                expect($("li").text().trim()).toContain("a public limited company");
                expect($("li").text().trim()).toContain("an unlimited company");
                expect($("li").text().trim()).toContain("a Community Interest Company (CIC)");
                expect($("li").text().trim()).toContain("a Limited Liability Partnership (LLP)");
                break;
            case STOP_TYPE.EMPTY_PSC_LIST:
                expect($("a.govuk-back-link").attr("href")).toBe(`${PrefixedUrls.CONFIRM_COMPANY}?companyNumber=00006400&lang=en`);
                expect($("p.govuk-body").text()).toContain("This company does not have any PSCs.");
                break;
            case STOP_TYPE.PSC_DOB_MISMATCH:
                expect($("a.govuk-back-link").attr("href")).toBe(`${expectedPrefix}/individual/personal-code?lang=en`);
                expect($("a#reenter-personal-code").attr("href")).toBe(`${expectedPrefix}/individual/personal-code?lang=en`);
                expect($("a#rp01-link").attr("href")).toBe(env.GET_RP01_LINK);
                break;
            case STOP_TYPE.SUPER_SECURE:
                expect($("a.govuk-back-link").attr("href")).toBe(`${PrefixedUrls.CONFIRM_COMPANY}?companyNumber=00006400&lang=en`);
                expect($("a#mail-to-dsr").attr("href")).toBe(`mailto:${env.DSR_EMAIL_ADDRESS}`);
                break;
            case STOP_TYPE.PROBLEM_WITH_PSC_DATA:
                expect($("p.govuk-body").text()).toContain("call or email Companies House");
                break;
            default:
                throw new Error(`Untested STOP_TYPE value: ${stopType}`);
        }

    });
});

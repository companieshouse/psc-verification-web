import { HttpStatusCode } from "axios";
import * as cheerio from "cheerio";
import request from "supertest";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import mockCsrfProtectionMiddleware from "../../../mocks/csrfProtectionMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls, STOP_TYPE } from "../../../../src/constants";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { closeTransaction } from "../../../../src/services/transactionService";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_VERIFICATION_FULL, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { getPscIndividual } from "../../../../src/services/pscService";
import { env } from "../../../../src/config";

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

jest.mock("../../../../src/services/transactionService", () => ({
    closeTransaction: jest.fn()
}));
const mockCloseTransaction = closeTransaction as jest.Mock;
mockCloseTransaction.mockResolvedValue({});

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
        const queryParams = new URLSearchParams("lang=en");
        const uriWithQuery = `${getUrlWithStopType(PrefixedUrls.STOP_SCREEN, stopType)}?${queryParams}`;
        const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);
        const expectedPrefix = "/persons-with-significant-control-verification/transaction/11111-22222-33333/submission/662a0de6a2c6f9aead0f32ab";

        const resp = await request(app).get(uri);

        const $ = cheerio.load(resp.text);

        expect(resp.status).toBe(HttpStatusCode.Ok);

        switch (stopType) {
            case STOP_TYPE.PSC_DOB_MISMATCH:
                expect($("a.govuk-back-link").attr("href")).toBe(`${expectedPrefix}/individual/personal-code?lang=en`);
                expect($("a#reenter-personal-code").attr("href")).toBe(`${expectedPrefix}/individual/personal-code?lang=en`);
                expect($("a#submit-paper-correction").attr("href")).toBe(`${expectedPrefix}/stop/${STOP_TYPE.RP01_GUIDANCE}?lang=en`);
                break;
            case STOP_TYPE.RP01_GUIDANCE:
                expect($("a.govuk-back-link").attr("href")).toBe(`${expectedPrefix}/stop/${STOP_TYPE.PSC_DOB_MISMATCH}?lang=en`);
                expect($("a#get-rp01-form").attr("href")).toBe(env.GET_RP01_LINK);
                expect($("a#get-psc01-form").attr("href")).toBe(env.GET_PSC01_LINK);
                expect($("a#post-to-ch").attr("href")).toBe(env.POST_TO_CH_LINK);
                expect($("a#verify-psc-service").attr("href")).toBe(PrefixedUrls.START);
                break;
            default:
                throw new Error(`Untested STOP_TYPE value: ${stopType}`);
        }

    });
});

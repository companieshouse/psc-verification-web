import middlewareMocks from "../mocks/allMiddleware.mock";
import { PrefixedUrls } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";
import { HttpStatusCode } from "axios";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { VALID_COMPANY_PSC_LIST } from "../mocks/companyPsc.mock";
import { COMPANY_NUMBER, PATCHED_INDIVIDUAL_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";
import { PSC_ID } from "../mocks/psc.mock";
import { getPscVerification, patchPscVerification } from "../../src/services/pscVerificationService";

const mockGetPscVerification = getPscVerification as jest.Mock;
mockGetPscVerification.mockResolvedValue(PATCHED_INDIVIDUAL_RESOURCE);

beforeEach(() => {
    jest.clearAllMocks();
});

jest.mock("../../src/services/pscVerificationService");
const mockPatchPscVerification = patchPscVerification as jest.Mock;

jest.mock("../../src/services/companyPscService", () => ({
    getCompanyIndividualPscList: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: VALID_COMPANY_PSC_LIST
    })
}));

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

beforeEach(() => {
    middlewareMocks.mockSessionMiddleware.mockClear();
    jest.clearAllMocks();
});

afterEach(() => {
    expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
});

describe("psc individual list get tests", () => {

    it("Should render the PSC Individual List page with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST);
        expect(resp.status).toBe(200);
    });
});

describe("psc individual list post tests", () => {
    beforeEach(() => {
        mockPatchPscVerification.mockReset();
    });

    // FIXME when the middleware is mocked
    it.skip("Should redirect to the personal code (uvid) page when a PSC is selected", async () => {
        mockPatchPscVerification.mockResolvedValueOnce(PATCHED_INDIVIDUAL_RESOURCE);
        const expectedPage = PrefixedUrls.PERSONAL_CODE;
        const expectedRedirectUrl = `${expectedPage.replace(":transactionId", TRANSACTION_ID).replace(":submissionId", PSC_VERIFICATION_ID)}?companyNumber=${COMPANY_NUMBER}&lang=en&pscType=individual`;

        await request(app)
            .post(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, TRANSACTION_ID, PSC_VERIFICATION_ID))
            .send({ pscId: PSC_ID })
            .set({ "Content-Type": "application/json-patch+json" })
            .query({ companyNumber: COMPANY_NUMBER, lang: "en", pscType: "individual", pscId: PSC_ID })
            .expect(HttpStatusCode.Ok)
            .expect("Location", expectedRedirectUrl);

    });

});

import middlewareMocks from "../mocks/allMiddleware.mock";
import { PrefixedUrls } from "../../src/constants";
import request from "supertest";
import app from "../../src/app";
import { HttpStatusCode } from "axios";
import { getCompanyProfile } from "../../src/services/companyProfileService";
import { getPscVerification } from "../../src/services/pscVerificationService";
import { validCompanyProfile } from "../mocks/companyProfile.mock";
import { VALID_COMPANY_PSC_LIST } from "../mocks/companyPsc.mock";
import { CREATED_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/pscVerification.mock";
import { getUrlWithTransactionIdAndSubmissionId } from "../../src/utils/url";
import { PSC_ID } from "../mocks/psc.mock";

jest.mock("../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: CREATED_RESOURCE
    })
}));

jest.mock("../../src/services/companyPscService", () => ({
    getCompanyIndividualPscList: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: VALID_COMPANY_PSC_LIST
    })
}));

jest.mock("../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const mockGetPscVerification = getPscVerification as jest.Mock;

beforeEach(() => {
    jest.clearAllMocks();
});

describe("psc individual list tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the PSC Type page with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.INDIVIDUAL_PSC_LIST);
        expect(resp.status).toBe(200);
    });

    it("Should redirect to the personal code (psc details) page when a PSC is selected", async () => {
        const expectedPage = PrefixedUrls.PERSONAL_CODE;
        const expectedRedirectUrl = `${expectedPage.replace(":transactionId", TRANSACTION_ID).replace(":submissionId", PSC_VERIFICATION_ID)}?lang=en&pscType=individual`;
        const resp = await request(app).post(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, TRANSACTION_ID, PSC_VERIFICATION_ID))
            .send({ pscId: PSC_ID })
            .set({ "Content-Type": "application/json" })
            .query({ lang: "en", pscType: "individual" })
            .expect(HttpStatusCode.Found)
            .expect("Location", expectedRedirectUrl);

    });

});

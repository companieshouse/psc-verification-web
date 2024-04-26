import middlewareMocks from "../../../mocks/allMiddleware.mock";
import request from "supertest";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { postTransaction } from "../../../../src/services/transactionService";
import { HttpStatusCode } from "axios";
import { CREATED_RESOURCE, FILING_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";

jest.mock("../../../../src/services/companyProfileService");
jest.mock("../../../../src/services/transactionService");
jest.mock("../../../../src/services/pscVerificationService", () => ({
    createPscVerification: () => ({
        httpStatusCode: 201,
        resource: CREATED_RESOURCE
    })
}));

const COMPANY_NUMBER = "12345678";
const diffCompanyHtml = "href=/persons-with-significant-control-verification/company-number";
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);
const mockPostTransaction = postTransaction as jest.Mock;

describe("confirm company tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(middlewareMocks.mockSessionMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should render the Confirm Company page with a successful status code", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.status).toBe(200);
    });

    it("Should display 'Confirm this is the correct company' message on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.text).toContain("Confirm this is the correct company");
    });

    it("Should include a 'Confirm and continue' button on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.text).toContain("Confirm and continue");
    });

    it("Should include a 'Choose a different company' button link on the Confirm Company page", async () => {
        const resp = await request(app).get(PrefixedUrls.CONFIRM_COMPANY);
        expect(resp.text).toContain(diffCompanyHtml);
    });

    it("Should create a transaction and redirect", async () => {
        mockPostTransaction.mockReturnValueOnce({ id: TRANSACTION_ID });
        const expectedRedirectUrl = `${PrefixedUrls.PSC_TYPE.replace(":transactionId", TRANSACTION_ID).replace(":submissionId", FILING_ID)}?lang=en`;

        await request(app)
            .post(PrefixedUrls.CONFIRM_COMPANY)
            .query({ companyNumber: "123456" })
            .expect(HttpStatusCode.Found)
            .expect("Location", expectedRedirectUrl);

        expect(mockPostTransaction).toHaveBeenCalled();
    });
});

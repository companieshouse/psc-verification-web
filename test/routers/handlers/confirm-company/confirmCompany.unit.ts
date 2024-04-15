import request from "supertest";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";

jest.mock("../../../../src/services/companyProfileService");

const COMPANY_NUMBER = "12345678";
const diffCompanyHtml = "href=/persons-with-significant-control-verification/company-number";
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

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
});

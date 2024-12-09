import * as httpMocks from "node-mocks-http";
import { PrefixedUrls, Urls } from "../../../../src/constants";
import { ConfirmCompanyHandler } from "../../../../src/routers/handlers/confirm-company/confirmCompany";
import { COMPANY_NUMBER } from "../../../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import mockCsrfProtectionMiddleware from "../../../mocks/csrfProtectionMiddleware.mock";

mockCsrfProtectionMiddleware.mockClear();

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

const request = httpMocks.createRequest({
    method: "GET",
    url: Urls.CONFIRM_COMPANY,
    query: {
        companyNumber: COMPANY_NUMBER,
        lang: "en"
    }
});
const response = httpMocks.createResponse();

describe("confirm company handler tests", () => {
    describe("executeGet tests", () => {

        it("Should render the confirmCompany screen", async () => {
            const handler = new ConfirmCompanyHandler();
            const { templatePath } = await handler.executeGet(request, response);

            expect(templatePath).toBe("router_views/confirmCompany/confirm-company");
        });

        it("should return the correct view data", async () => {
            const handler = new ConfirmCompanyHandler();
            const { viewData } = await handler.executeGet(request, response);

            expect(viewData).toMatchObject({
                backURL: `/company-lookup/search?forward=%2Fpersons-with-significant-control-verification%2Fconfirm-company%3FcompanyNumber%3D%7BcompanyNumber%7D%26lang%3Den`,
                currentUrl: `/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en`
            });
        });
    });
    describe("executePost tests", () => {
        it("Should redirect to the psc-type screen", async () => {
            const request = httpMocks.createRequest({
                method: "POST",
                url: Urls.CONFIRM_COMPANY,
                body: {
                    companyNumber: COMPANY_NUMBER,
                    lang: "en"
                }
            });
            const response = httpMocks.createResponse();
            const handler = new ConfirmCompanyHandler();
            const redirectUrl = await handler.executePost(request, response);
            expect(redirectUrl).toBe(`${PrefixedUrls.INDIVIDUAL_PSC_LIST}?companyNumber=${COMPANY_NUMBER}&lang=en`);

        });
    });
});

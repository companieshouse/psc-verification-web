import { COMPANY_NUMBER } from "../../../mocks/pscVerification.mock";
import { VALID_COMPANY_PSC_ITEMS } from "../../../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getCompanyIndividualPscList } from "../../../../src/services/companyPscService";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { IndividualPscListHandler } from "../../../../src/routers/handlers/individual-psc-list/individualPscListHandler";

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

jest.mock("../../../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;
mockGetCompanyIndividualPscList.mockResolvedValueOnce(VALID_COMPANY_PSC_ITEMS.filter(psc => /^individual/.test(psc.kind)));

describe("psc type handler", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("execute", () => {
        it("should return the correct template path and view data", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.INDIVIDUAL_PSC_LIST,
                query: {
                    companyNumber: COMPANY_NUMBER,
                    lang: "en"
                }
            });

            const res = httpMocks.createResponse({});
            const handler = new IndividualPscListHandler();

            const { templatePath, viewData } = await handler.execute(req, res);

            expect(templatePath).toBe("router_views/individualPscList/individualPscList");
            expect(viewData).toMatchObject({
                backURL: `/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en`,
                currentUrl: `/persons-with-significant-control-verification/individual/psc-list?companyNumber=${COMPANY_NUMBER}&lang=en`,
                nextPageUrl: `/persons-with-significant-control-verification/new-submission?companyNumber=${COMPANY_NUMBER}&lang=en&selectedPscId=`
            });

        });
    });
});

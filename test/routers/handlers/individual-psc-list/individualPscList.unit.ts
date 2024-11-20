import { HttpStatusCode } from "axios";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_CREATED, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { VALID_COMPANY_PSC_ITEMS } from "../../../mocks/companyPsc.mock";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { getCompanyIndividualPscList } from "../../../../src/services/companyPscService";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { IndividualPscListHandler } from "../../../../src/routers/handlers/individual-psc-list/individualPscListHandler";

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;
mockGetPscVerification.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_VERIFICATION_CREATED
});

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
    describe("executeGet", () => {
        it("should return the correct template path and view data", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.INDIVIDUAL_PSC_LIST,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    pscType: "individual",
                    companyNumber: COMPANY_NUMBER,
                    lang: "en"
                }
            });

            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_CREATED } });
            const handler = new IndividualPscListHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect(templatePath).toBe("router_views/individualPscList/individualPscList");
            expect(viewData).toMatchObject({
                backURL: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/psc-type?lang=en&pscType=individual`,
                currentUrl: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/psc-list?lang=en&pscType=individual`
            });

        });
    });
    describe("executePost", () => {
        it("should patch the submission data", async () => {
            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.INDIVIDUAL_PSC_LIST,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    lang: "en",
                    companyNumber: COMPANY_NUMBER
                },
                body: {
                    pscType: "individual"
                }
            });

            const res = httpMocks.createResponse();
            const handler = new IndividualPscListHandler();

            const redirectUrl = await handler.executePost(req, res);

            expect(redirectUrl).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/personal-code?lang=en`);
        });
    });
});

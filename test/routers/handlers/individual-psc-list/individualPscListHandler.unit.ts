import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { PSC_KIND_TYPE, Urls } from "../../../../src/constants";
import { IndividualPscListHandler } from "../../../../src/routers/handlers/individual-psc-list/individualPscListHandler";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import { getCompanyIndividualPscList } from "../../../../src/services/companyPscService";
import { getPscIndividual } from "../../../../src/services/pscService";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { INDIVIDUAL_PSCS_LIST, SUPER_SECURE_PSCS_EXCLUSIVE_LIST, VERIFIED_PSC, VERIFY_LATER_PSC, VERIFY_NOW_PSC } from "../../../mocks/companyPsc.mock";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_CREATED } from "../../../mocks/pscVerification.mock";

const mockGetPscVerification = getPscVerification as jest.Mock;
jest.mock("../../../../src/services/pscVerificationService");
mockGetPscVerification.mockResolvedValueOnce({
    httpStatusCode: HttpStatusCode.Ok,
    resource: INDIVIDUAL_VERIFICATION_CREATED
});

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;
mockGetCompanyProfile.mockResolvedValue(validCompanyProfile);

jest.mock("../../../../src/services/companyPscService");
const mockGetCompanyIndividualPscList = getCompanyIndividualPscList as jest.Mock;

jest.mock("../../../../src/services/pscService");
const mockGetPscIndividual = getPscIndividual as jest.Mock;

describe("psc list handler", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });
    describe("executeGet", () => {
        it("should return the correct template path and view data (excluding super secure PSCs)", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.INDIVIDUAL_PSC_LIST,
                query: {
                    companyNumber: COMPANY_NUMBER,
                    lang: "en"
                }
            });

            const ordinaryAndSuperSecurePscs = [...INDIVIDUAL_PSCS_LIST, ...INDIVIDUAL_PSCS_LIST, ...SUPER_SECURE_PSCS_EXCLUSIVE_LIST];

            mockGetCompanyIndividualPscList.mockResolvedValue(ordinaryAndSuperSecurePscs);
            mockGetPscIndividual
                .mockResolvedValueOnce(VERIFY_NOW_PSC)
                .mockResolvedValueOnce(VERIFY_NOW_PSC)
                .mockResolvedValueOnce(VERIFY_LATER_PSC)
                .mockResolvedValueOnce(VERIFIED_PSC);

            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_CREATED } });
            const handler = new IndividualPscListHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect(templatePath).toBe("router_views/individualPscList/individual-psc-list");
            expect(viewData).toMatchObject({
                backURL: `/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en`,
                currentUrl: `/persons-with-significant-control-verification/individual/psc-list?companyNumber=${COMPANY_NUMBER}&lang=en`,
                nextPageUrl: `/persons-with-significant-control-verification/new-submission?companyNumber=${COMPANY_NUMBER}&lang=en&selectedPscId=`
            });
            viewData.canVerifyNowDetails.forEach(p => expect(p.pscKind).toBe(PSC_KIND_TYPE.INDIVIDUAL));
            viewData.canVerifyLaterDetails.forEach(p => expect(p.pscKind).toBe(PSC_KIND_TYPE.INDIVIDUAL));
            viewData.verifiedPscDetails.forEach(p => expect(p.pscKind).toBe(PSC_KIND_TYPE.INDIVIDUAL));
        });
    });
});

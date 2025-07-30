import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { PrefixedUrls, STOP_TYPE, toStopScreenPrefixedUrl } from "../../../../src/constants";
import { StopScreenHandler } from "../../../../src/routers/handlers/stop-screen/stopScreenHandler";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";
import { getPscIndividual } from "../../../../src/services/pscService";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_VERIFICATION_FULL, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { env } from "../../../../src/config";

jest.mock("../../../../src/services/pscService");
const mockGetPscIndividual = getPscIndividual as jest.Mock;
mockGetPscIndividual.mockResolvedValue({
    httpStatusCode: HttpStatusCode.Ok,
    resource: PSC_INDIVIDUAL
});

jest.mock("../../../../src/services/pscVerificationService");
const mockGetPscVerification = getPscVerification as jest.Mock;

jest.mock("../../../../src/services/companyProfileService");
const mockGetCompanyProfile = getCompanyProfile as jest.Mock;

describe("Stop screen handler", () => {
    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("executeGet", () => {

        it.each(Object.values(STOP_TYPE))("Should render the correct '%s' stop screen view", async (stopType: STOP_TYPE) => {
            const request = httpMocks.createRequest({
                method: "GET",
                url: getUrlWithStopType(toStopScreenPrefixedUrl(stopType), stopType),
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID,
                    stopType
                },
                query: {
                    companyNumber: "00006400"
                }
            });
            const response = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_FULL, companyProfile: validCompanyProfile, locale: { lang: "en" } } });
            const handler = new StopScreenHandler();
            const expectedPrefix = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}`;
            const expectedStopUri = getUrlWithStopType(toStopScreenPrefixedUrl(stopType), stopType);
            const expectedCurrentUri = getUrlWithTransactionIdAndSubmissionId(expectedStopUri, TRANSACTION_ID, PSC_VERIFICATION_ID);

            const resp = await handler.executeGet(request, response);
            const viewData = resp.viewData;

            expect(resp.templatePath).toBe(`router_views/stopScreen/${stopType}`);
            const expectedViewData = {
                templateName: stopType,
                currentUrl: `${expectedCurrentUri}?lang=en`,
                errors: {}
            };

            switch (stopType) {
                case STOP_TYPE.COMPANY_STATUS:
                    expect(viewData).toMatchObject(
                        {
                            ...expectedViewData,
                            currentUrl: `/persons-with-significant-control-verification/stop/${stopType}?companyNumber=00006400&lang=en`,
                            backURL: `${PrefixedUrls.CONFIRM_COMPANY}?lang=en&companyNumber=00006400`,
                            extraData: [validCompanyProfile.companyName, `${PrefixedUrls.COMPANY_NUMBER}?lang=en`, env.CONTACT_US_LINK]
                        });
                    break;
                case STOP_TYPE.COMPANY_TYPE:
                    expect(viewData).toMatchObject(
                        {
                            ...expectedViewData,
                            currentUrl: `/persons-with-significant-control-verification/stop/${stopType}?companyNumber=00006400&lang=en`,
                            backURL: `${PrefixedUrls.CONFIRM_COMPANY}?lang=en&companyNumber=00006400`,
                            extraData: [validCompanyProfile.companyName, `${PrefixedUrls.COMPANY_NUMBER}?lang=en`, env.CONTACT_US_LINK]
                        });
                    break;
                case STOP_TYPE.EMPTY_PSC_LIST:
                    expect(viewData).toMatchObject({
                        ...expectedViewData,
                        currentUrl: `/persons-with-significant-control-verification/stop/${stopType}?companyNumber=00006400&lang=en`,
                        backURL: `${PrefixedUrls.CONFIRM_COMPANY}?companyNumber=00006400&lang=en`
                    });
                    break;
                case STOP_TYPE.PSC_DOB_MISMATCH:
                    expect(viewData).toMatchObject(
                        {
                            ...expectedViewData,
                            backURL: `${expectedPrefix}/individual/personal-code?lang=en`,
                            extraData: [env.GET_RP01_LINK, env.WEBFILING_LOGIN_URL]
                        });
                    break;
                case STOP_TYPE.SUPER_SECURE:
                    expect(viewData).toMatchObject({
                        ...expectedViewData,
                        currentUrl: `/persons-with-significant-control-verification/stop/${stopType}?companyNumber=00006400&lang=en`,
                        backURL: `${PrefixedUrls.CONFIRM_COMPANY}?companyNumber=00006400&lang=en`,
                        extraData: [env.DSR_EMAIL_ADDRESS, env.DSR_PHONE_NUMBER]
                    });
                    break;
                case STOP_TYPE.PROBLEM_WITH_PSC_DATA:
                    expect(viewData).toMatchObject({
                        ...expectedViewData,
                        currentUrl: `/persons-with-significant-control-verification/stop/${stopType}?companyNumber=00006400&lang=en`
                    });
                    break;
                default:
                    throw new Error(`Untested STOP_TYPE value: ${stopType}`);
            }

            expect(mockGetPscVerification).not.toHaveBeenCalled();
            expect(mockGetCompanyProfile).not.toHaveBeenCalled();
            expect(mockGetPscIndividual).not.toHaveBeenCalled();
        });
    });
});

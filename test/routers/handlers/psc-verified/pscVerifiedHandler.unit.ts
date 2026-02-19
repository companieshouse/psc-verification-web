import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { PscVerifiedHandler } from "../../../../src/routers/handlers/psc-verified/pscVerifiedHandler";
import { getPscIndividual } from "../../../../src/services/pscService";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import { getCompanyProfile } from "../../../../src/services/companyProfileService";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_FULL, PSC_NOTIFICATION_ID, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { validCompanyProfile } from "../../../mocks/companyProfile.mock";
import { logger } from "../../../../src/lib/logger";

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

describe("PSC Verified handler", () => {
    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("executeGet", () => {
        let request: any;
        let response: any;

        beforeEach(() => {
            request = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_VERIFIED,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    pscType: "individual"
                }
            });
            response = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_FULL, companyProfile: validCompanyProfile, lang: "en" } });
        });

        it("Should resolve correct view data", async () => {
            const handler = new PscVerifiedHandler();
            const resp = await handler.executeGet(request, response);

            expect(resp.templatePath).toBe("router_views/pscVerified/psc-verified");
            expect(resp.viewData).toMatchObject({
                companyNumber: COMPANY_NUMBER,
                companyName: "Test Company",
                pscName: "Sir Forename Middlename Surname",
                referenceNumber: TRANSACTION_ID,
                errors: {}
            });
            expect(mockGetPscVerification).not.toHaveBeenCalled();
            expect(mockGetCompanyProfile).not.toHaveBeenCalled();
            expect(mockGetPscIndividual).toHaveBeenCalledTimes(1);
            expect(mockGetPscIndividual).toHaveBeenCalledWith(request, COMPANY_NUMBER, PSC_NOTIFICATION_ID);
        });

        it("Should resolve correct view data when req.param.transactionId is an array", async () => {
            request = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_VERIFIED,
                params: {
                    transactionId: [TRANSACTION_ID],
                    submissionId: [PSC_VERIFICATION_ID]
                },
                query: {
                    pscType: "individual"
                }
            });

            jest.spyOn(logger, "info").mockImplementation(() => {});

            const handler = new PscVerifiedHandler();
            const resp = await handler.executeGet(request, response);
            expect(resp.viewData.referenceNumber).toBe(TRANSACTION_ID);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("called for transactionId=\"11111-22222-33333\", submissionId=\"662a0de6a2c6f9aead0f32ab\""));
        });

        it("Should resolve correct view data when req.param.transactionId is empty", async () => {
            request = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_VERIFIED,
                params: {
                    transactionId: "",
                    submissionId: ""
                },
                query: {
                    pscType: "individual"
                }
            });

            jest.spyOn(logger, "info").mockImplementation(() => {});
            const handler = new PscVerifiedHandler();

            const resp = await handler.executeGet(request, response);
            expect(resp.viewData.referenceNumber).toBe("");
            // Verify logger.info was called with the correct message
            expect(logger.info).toHaveBeenCalledTimes(1);
            expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("called for transactionId=\"\", submissionId=\"\""));
        });
    });

});

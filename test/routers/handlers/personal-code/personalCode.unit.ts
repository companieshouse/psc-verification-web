import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { PersonalCodeHandler } from "../../../../src/routers/handlers/personal-code/personalCodeHandler";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_PATCH, PATCH_PERSONAL_CODE_DATA, PSC_APPOINTMENT_ID, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { getPscIndividual } from "../../../../src/services/pscService";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { HttpStatusCode } from "axios";
import { getPscVerification } from "../../../../src/services/pscVerificationService";

jest.mock("../../../../src/services/pscVerificationService");
jest.mock("../../../../src/services/pscService");

const mockGetPscVerification = getPscVerification as jest.Mock;
const mockGetPscIndividual = getPscIndividual as jest.Mock;

describe("personal code handler tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockGetPscVerification.mockResolvedValue({
            httpStatusCode: HttpStatusCode.Ok,
            resource: INDIVIDUAL_VERIFICATION_PATCH
        });

        mockGetPscIndividual.mockResolvedValue({
            httpStatusCode: HttpStatusCode.Ok,
            resource: PSC_INDIVIDUAL
        });
    });

    describe("executeGet", () => {

        it("should return the correct template path", async () => {

            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PERSONAL_CODE,
                query: { selectedPscId: PSC_APPOINTMENT_ID }
            });

            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_PATCH } });
            const handler = new PersonalCodeHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect(templatePath).toBe("router_views/personal_code/personal_code");
        });

        it("should return the correct view data", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_TYPE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    pscAppointmentId: PSC_APPOINTMENT_ID,
                    lang: "en"
                }
            });
        });

        it("should have the correct page URLs", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_TYPE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_APPOINTMENT_ID,
                    lang: "en"
                }
            });
            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_PATCH } });
            const handler = new PersonalCodeHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect(viewData).toMatchObject({
                backURL: `/persons-with-significant-control-verification/individual/psc-list?companyNumber=12345678&lang=en`,
                currentUrl: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/personal-code?lang=en`
            });
        });
    });

    describe("executePost", () => {
        it("should return the correct next page", async () => {
            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    lang: "en",
                    selectedPscId: PSC_APPOINTMENT_ID
                },
                body: {
                    PscVerificationData: PATCH_PERSONAL_CODE_DATA
                }
            });

            const res = httpMocks.createResponse({});
            const handler = new PersonalCodeHandler();

            const nextPage = await handler.executePost(req, res);
            expect(nextPage).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/psc-statement?lang=en`);
        });
    });
});

import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { COMPANY_NUMBER, IND_VERIFICATION_PERSONAL_CODE, PATCH_PERSONAL_CODE_DATA, PSC_VERIFICATION_ID, TRANSACTION_ID, UVID } from "../../../mocks/pscVerification.mock";
import { patchPscVerification } from "../../../../src/services/pscVerificationService";
import { PersonalCodeHandler } from "../../../../src/routers/handlers/personal-code/personalCodeHandler";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: jest.fn(),
    patchPscVerification: jest.fn(),
    getPscIndividual: jest.fn()
}));

jest.mock("../../../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    }),
    patchPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PATCH_PERSONAL_CODE_DATA
    })
}));

const mockValidatePersonalCode = jest.fn();

jest.mock("../../../../src/lib/validation/form-validators/pscVerification", () => ({
    PscVerificationFormsValidator: jest.fn().mockImplementation(() => ({
        validatePersonalCode: mockValidatePersonalCode
    }))
}));

describe("Personal code handler", () => {
    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("executeGet", () => {

        it("should resolve correct view data", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_VERIFIED,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    lang: "en",
                    pscType: "individual"
                }

            });
            const res = httpMocks.createResponse({ locals: { submission: IND_VERIFICATION_PERSONAL_CODE } });
            const handler = new PersonalCodeHandler();
            const expectedPrefix = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}`;

            const resp = await handler.executeGet(req, res);

            expect(resp.templatePath).toBe("router_views/personal_code/personal_code");
            expect(resp.viewData).toMatchObject({
                currentUrl: `${expectedPrefix}/individual/personal-code?lang=en`,
                personalCode: "123abc456edf",
                pscName: "Sir Forename Middlename Surname",
                monthYearBorn: "April 2000",
                backURL: `${expectedPrefix}/individual/psc-list?lang=en`,
                backLinkDataEvent: "personal-code-back-link",
                errors: {}
            });
        });
    });

    describe("executePost", () => {
        it("should patch the submission data", async () => {

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.INDIVIDUAL_STATEMENT,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    lang: "en",
                    pscType: "individual"
                },
                body: {
                    personalCode: UVID
                }
            });

            const res = httpMocks.createResponse();
            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscAppointmentId: PSC_VERIFICATION_ID
                }
            };

            const handler = new PersonalCodeHandler();

            const model = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(1);
            expect(patchPscVerification).toHaveBeenCalledWith(req, TRANSACTION_ID, PSC_VERIFICATION_ID, {
                verificationDetails: {
                    uvid: UVID
                }
            });
        });

        it("should handle errors and return the correct view data with errors", async () => {

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.INDIVIDUAL_STATEMENT,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    lang: "en",
                    pscType: "individual"
                },
                body: {
                    personalCode: ""
                }
            });

            // create an error response
            const res = httpMocks.createResponse();
            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscAppointmentId: PSC_VERIFICATION_ID
                }
            };

            const errors = {
                status: 400,
                name: "VALIDATION_ERRORS",
                message: "validation_error_summary",
                stack: {
                    personalCode: {
                        summary: "Enter the Companies House personal code for Ralph Tudor",
                        inline: "Enter the Companies House personal code for Ralph Tudor"
                    }
                }
            };

            mockValidatePersonalCode.mockImplementationOnce(() => Promise.reject(errors));

            const handler = new PersonalCodeHandler();
            const result = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(0);
            expect(result.viewData.errors).toBeDefined();
            expect(result.viewData.errors.personalCode).toEqual({
                summary: "Enter the Companies House personal code for Ralph Tudor",
                inline: "Enter the Companies House personal code for Ralph Tudor"
            });

        });

    });

});

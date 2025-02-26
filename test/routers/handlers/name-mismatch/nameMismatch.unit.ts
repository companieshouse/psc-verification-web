import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { NameMismatchReasonEnum } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { COMPANY_NUMBER, IND_VERIFICATION_NAME_MISMATCH_UNDEFINED, PATCH_NAME_MISMATCH_DATA, PSC_APPOINTMENT_ID, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { patchPscVerification } from "../../../../src/services/pscVerificationService";
import { NameMismatchHandler } from "../../../../src/routers/handlers/name-mismatch/nameMismatchHandler";

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
        resource: PATCH_NAME_MISMATCH_DATA
    })
}));

const mockValidateNameMismatch = jest.fn();

jest.mock("../../../../src/lib/validation/form-validators/pscVerification", () => ({
    PscVerificationFormsValidator: jest.fn().mockImplementation(() => ({
        validateNameMismatch: mockValidateNameMismatch
    }))
}));

describe("Name mismatch handler", () => {
    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("executeGet", () => {

        it("should return the correct template path", async () => {

            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.NAME_MISMATCH,
                query: { selectedPscId: PSC_APPOINTMENT_ID }
            });

            const res = httpMocks.createResponse({ locals: { submission: IND_VERIFICATION_NAME_MISMATCH_UNDEFINED } });
            const handler = new NameMismatchHandler();

            const { templatePath } = await handler.executeGet(req, res);

            expect(templatePath).toBe("router_views/nameMismatch/name-mismatch");
        });

        it("should have the correct page URLs", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.NAME_MISMATCH,
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
            const res = httpMocks.createResponse({ locals: { submission: IND_VERIFICATION_NAME_MISMATCH_UNDEFINED } });
            const handler = new NameMismatchHandler();

            const { viewData } = await handler.executeGet(req, res);

            expect(viewData).toMatchObject({
                backURL: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/personal-code?lang=en`,
                currentUrl: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/psc-why-this-name?lang=en`
            });
        });

        it("should resolve the correct view data", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.NAME_MISMATCH,
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

            const res = httpMocks.createResponse({ locals: { submission: IND_VERIFICATION_NAME_MISMATCH_UNDEFINED } });
            const handler = new NameMismatchHandler();
            const resp = await handler.executeGet(req, res);

            expect(resp.templatePath).toBe("router_views/nameMismatch/name-mismatch");
            expect(resp.viewData).toMatchObject({
                nameMismatch: "",
                pscName: "Sir Forename Middlename Surname",
                monthYearBorn: "April 2000",
                errors: {}
            });
        });
    });

    describe("executePost", () => {

        it("should return the correct next page", async () => {

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.NAME_MISMATCH,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_APPOINTMENT_ID,
                    lang: "en"
                },
                body: {
                    nameMismatch: NameMismatchReasonEnum.PUBLIC_REGISTER_ERROR
                }
            });

            const res = httpMocks.createResponse();

            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscAppointmentId: PSC_VERIFICATION_ID,
                    lang: "en"
                }
            };

            const handler = new NameMismatchHandler();

            const model = await handler.executePost(req, res);

            expect(model.viewData).toMatchObject({
                nextPageUrl: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/psc-statement?lang=en`
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
                    nameMismatchReason: ""
                }
            });

            // create an error response as no name mismatch reason is provided
            const res = httpMocks.createResponse();
            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscAppointmentId: PSC_APPOINTMENT_ID
                }
            };

            const errors = {
                status: 400,
                name: "VALIDATION_ERRORS",
                message: "validation_error_summary",
                stack: {
                    nameMismatch: {
                        summary: "Tell us why the name on the public register is different to the name this PSC used for identity verification",
                        inline: "Tell us why the name on the public register is different to the name this PSC used for identity verification"
                    }
                }
            };

            mockValidateNameMismatch.mockImplementationOnce(() => Promise.reject(errors));

            const handler = new NameMismatchHandler();
            const result = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(0);
            expect(result.viewData.errors).toBeDefined();
            expect(result.viewData.errors.nameMismatch).toEqual({
                summary: "Tell us why the name on the public register is different to the name this PSC used for identity verification",
                inline: "Tell us why the name on the public register is different to the name this PSC used for identity verification"
            });

        });

    });

});

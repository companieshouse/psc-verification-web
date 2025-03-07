import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { COMPANY_NUMBER, IND_VERIFICATION_PERSONAL_CODE, PATCH_PERSONAL_CODE_DATA, PATCH_RESP_NO_NAME_MISMATCH, PATCH_RESP_WITH_NAME_MISMATCH, PSC_NOTIFICATION_ID, PSC_VERIFICATION_ID, TRANSACTION_ID, UVID, VALIDATION_STATUS_RESOURCE_INVALID_DOB, VALIDATION_STATUS_RESOURCE_INVALID_DOB_NAME, VALIDATION_STATUS_RESOURCE_INVALID_NAME, VALIDATION_STATUS_RESOURCE_VALID } from "../../../mocks/pscVerification.mock";
import { PersonalCodeHandler } from "../../../../src/routers/handlers/personal-code/personalCodeHandler";
import { getValidationStatus, patchPscVerification } from "../../../../src/services/pscVerificationService";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: jest.fn(),
    patchPscVerification: jest.fn(),
    getPscIndividual: jest.fn(),
    getValidationStatus: jest.fn()
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

        it("should return the correct template path", async () => {

            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PERSONAL_CODE,
                query: { selectedPscId: PSC_NOTIFICATION_ID }
            });

            const res = httpMocks.createResponse({ locals: { submission: IND_VERIFICATION_PERSONAL_CODE } });
            const handler = new PersonalCodeHandler();

            const { templatePath } = await handler.executeGet(req, res);

            expect(templatePath).toBe("router_views/personalCode/personal-code");
        });

        it("should have the correct page URLs", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_NOTIFICATION_ID,
                    lang: "en"
                }
            });
            const res = httpMocks.createResponse({ locals: { submission: IND_VERIFICATION_PERSONAL_CODE } });
            const handler = new PersonalCodeHandler();

            const { viewData } = await handler.executeGet(req, res);

            expect(viewData).toMatchObject({
                backURL: `/persons-with-significant-control-verification/individual/psc-list?companyNumber=12345678&lang=en`,
                currentUrl: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/personal-code?lang=en`
            });
        });

        it("should resolve the correct view data", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_NOTIFICATION_ID,
                    lang: "en"
                }
            });

            const res = httpMocks.createResponse({ locals: { submission: IND_VERIFICATION_PERSONAL_CODE } });
            const handler = new PersonalCodeHandler();

            const resp = await handler.executeGet(req, res);

            expect(resp.templatePath).toBe("router_views/personalCode/personal-code");
            expect(resp.viewData).toMatchObject({
                personalCode: "",
                pscName: "Sir Forename Middlename Surname",
                monthYearBorn: "April 2000",
                errors: {}
            });
        });
    });

    describe("executePost", () => {
        const mockGetValidationStatus = getValidationStatus as jest.Mock;
        const mockPatchPscVerification = patchPscVerification as jest.Mock;

        it("should return the PSC statement page when the validation status is valid", async () => {
            mockGetValidationStatus.mockReturnValue(VALIDATION_STATUS_RESOURCE_VALID);
            mockPatchPscVerification.mockReturnValue(PATCH_RESP_NO_NAME_MISMATCH);

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_NOTIFICATION_ID,
                    lang: "en"
                },
                body: {
                    personalCode: UVID
                }
            });

            const res = httpMocks.createResponse();

            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscNotificationId: PSC_VERIFICATION_ID,
                    lang: "en"
                }
            };

            const handler = new PersonalCodeHandler();

            const model = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(1);
            expect(model.viewData.nextPageUrl).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/psc-statement?lang=en`);

        });

        it("should return the name mismatch page when the validation status is valid and have a name mismatch", async () => {
            mockGetValidationStatus.mockReturnValue(VALIDATION_STATUS_RESOURCE_VALID);
            mockPatchPscVerification.mockReturnValue(PATCH_RESP_WITH_NAME_MISMATCH);

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_NOTIFICATION_ID,
                    lang: "en"
                },
                body: {
                    personalCode: UVID
                }
            });

            const res = httpMocks.createResponse();

            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscNotificationId: PSC_VERIFICATION_ID,
                    lang: "en"
                }
            };

            const handler = new PersonalCodeHandler();

            const model = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(1);
            expect(model.viewData.nextPageUrl).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/psc-why-this-name?lang=en`);

        });

        it("should return the name mismatch page when there are name validation errors", async () => {
            mockGetValidationStatus.mockReturnValue(VALIDATION_STATUS_RESOURCE_INVALID_NAME);

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_NOTIFICATION_ID,
                    lang: "en"
                },
                body: {
                    personalCode: UVID
                }
            });

            const res = httpMocks.createResponse();

            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscNotificationId: PSC_VERIFICATION_ID,
                    lang: "en"
                }
            };

            const handler = new PersonalCodeHandler();

            const model = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(1);
            expect(model.viewData.nextPageUrl).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/psc-why-this-name?lang=en`);

        });

        it("should return the DOB mismatch stop page when there is a DOB validation error", async () => {
            mockGetValidationStatus.mockReturnValue(VALIDATION_STATUS_RESOURCE_INVALID_DOB);

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_NOTIFICATION_ID,
                    lang: "en"
                },
                body: {
                    personalCode: UVID
                }
            });

            const res = httpMocks.createResponse();

            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscNotificationId: PSC_VERIFICATION_ID,
                    lang: "en"
                }
            };

            const handler = new PersonalCodeHandler();

            const model = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(1);
            expect(model.viewData.nextPageUrl).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/stop/psc-dob-mismatch?lang=en`);
        });

        it("should return the DOB mismatch stop page when there is a UVID/personal code validation error", async () => {
            mockGetValidationStatus.mockReturnValue(VALIDATION_STATUS_RESOURCE_INVALID_DOB);

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_NOTIFICATION_ID,
                    lang: "en"
                },
                body: {
                    personalCode: UVID
                }
            });

            const res = httpMocks.createResponse();

            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscNotificationId: PSC_VERIFICATION_ID,
                    lang: "en"
                }
            };

            const handler = new PersonalCodeHandler();

            const model = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(1);
            expect(model.viewData.nextPageUrl).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/stop/psc-dob-mismatch?lang=en`);
        });

        it("should return the DOB mismatch stop page when there is both a DOB and name mismatch validation errors", async () => {
            mockGetValidationStatus.mockReturnValue(VALIDATION_STATUS_RESOURCE_INVALID_DOB_NAME);

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PERSONAL_CODE,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    companyNumber: COMPANY_NUMBER,
                    selectedPscId: PSC_NOTIFICATION_ID,
                    lang: "en"
                },
                body: {
                    personalCode: UVID
                }
            });

            const res = httpMocks.createResponse();

            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscNotificationId: PSC_VERIFICATION_ID,
                    lang: "en"
                }
            };

            const handler = new PersonalCodeHandler();

            const model = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(1);
            expect(model.viewData.nextPageUrl).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/stop/psc-dob-mismatch?lang=en`);

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

            // create an error response as no personal code is provided
            const res = httpMocks.createResponse();
            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscNotificationId: PSC_NOTIFICATION_ID
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
            expect(getValidationStatus).toHaveBeenCalledTimes(0);
            expect(result.viewData.errors).toBeDefined();
            expect(result.viewData.errors.personalCode).toEqual({
                summary: "Enter the Companies House personal code for Ralph Tudor",
                inline: "Enter the Companies House personal code for Ralph Tudor"
            });

        });

    });

});

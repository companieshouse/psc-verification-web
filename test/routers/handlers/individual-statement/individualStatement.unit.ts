import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { IndividualStatementHandler } from "../../../../src/routers/handlers/individual-statement/individualStatementHandler";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_FULL, INDIVIDUAL_VERIFICATION_FULL_NAME_MISMATCH, PATCH_INDIVIDUAL_STATEMENT_DATA, PSC_NOTIFICATION_ID, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { VerificationStatementEnum } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { patchPscVerification } from "../../../../src/services/pscVerificationService";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: jest.fn(),
    patchPscVerification: jest.fn()
}));

jest.mock("../../../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    }),
    patchPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PATCH_INDIVIDUAL_STATEMENT_DATA
    })
}));

const mockValidateIndividualStatement = jest.fn();
jest.mock("../../../../src/lib/validation/form-validators/pscVerification", () => ({
    PscVerificationFormsValidator: jest.fn().mockImplementation(() => ({
        validateIndividualStatement: mockValidateIndividualStatement
    }))
}));

describe("Individual statement handler", () => {
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

            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_FULL, lang: "en" } });
            const handler = new IndividualStatementHandler();

            const { templatePath } = await handler.executeGet(req, res);

            expect(templatePath).toBe("router_views/individualStatement/individual-statement");
        });

        it("should have the correct page URLs", async () => {

            const expectedPrefix = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}`;
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
            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_FULL, lang: "en" } });
            const handler = new IndividualStatementHandler();

            const { viewData } = await handler.executeGet(req, res);

            expect(viewData).toMatchObject({
                backURL: `${expectedPrefix}/individual/personal-code?lang=en&selectedPscId=123456`
            });
        });

        it("should have the correct page URLs when there is a name mismatch", async () => {

            const expectedPrefix = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}`;
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
            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_FULL_NAME_MISMATCH, lang: "en" } });
            const handler = new IndividualStatementHandler();

            const { viewData } = await handler.executeGet(req, res);

            expect(viewData).toMatchObject({
                backURL: `${expectedPrefix}/individual/psc-why-this-name?lang=en&selectedPscId=123456`
            });
        });

        it("should resolve correct view data", async () => {
            const req = httpMocks.createRequest({
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
            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_FULL, lang: "en" } });
            const handler = new IndividualStatementHandler();

            const { viewData } = await handler.executeGet(req, res);

            expect(viewData).toMatchObject({
                selectedStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED],
                pscName: "Sir Forename Middlename Surname",
                dateOfBirth: "April 2000",
                errors: {}
            });
        });
    });

    describe("executePost", () => {
        it("should patch the submission data", async () => {
            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PSC_VERIFIED,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    pscType: "individual"
                },
                body: {
                    pscIndividualStatement: VerificationStatementEnum.INDIVIDUAL_VERIFIED
                }
            });
            const res = httpMocks.createResponse();
            res.locals.lang = "en";
            const handler = new IndividualStatementHandler();

            const resp = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(1);
            expect(patchPscVerification).toHaveBeenCalledWith(req, TRANSACTION_ID, PSC_VERIFICATION_ID, PATCH_INDIVIDUAL_STATEMENT_DATA);
        });

        it("should generate a validation error when no statement is selected", async () => {

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PSC_VERIFIED,
                params: {
                    transactionId: TRANSACTION_ID,
                    submissionId: PSC_VERIFICATION_ID
                },
                query: {
                    lang: "en",
                    pscType: "individual"
                },
                body: {
                    pscIndividualStatement: ""
                }
            });

            // create an error response
            const res = httpMocks.createResponse();
            res.locals.submission = {
                data: {
                    companyNumber: COMPANY_NUMBER,
                    pscNotificationId: PSC_NOTIFICATION_ID
                }
            };
            res.locals.lang = "en";

            const errors = {
                status: 400,
                name: "VALIDATION_ERRORS",
                message: "validation_error_summary",
                stack: {
                    individualStatement: {
                        summary: "Select the identity verification statement for Ralph Tudor",
                        inline: "Select the identity verification statement for Ralph Tudor"
                    }
                }
            };

            mockValidateIndividualStatement.mockImplementationOnce(() => Promise.reject(errors));

            const handler = new IndividualStatementHandler();
            const result = await handler.executePost(req, res);

            expect(patchPscVerification).toHaveBeenCalledTimes(0);
            expect(result.viewData.errors).toBeDefined();
            expect(result.viewData.errors.individualStatement).toEqual({
                summary: "Select the identity verification statement for Ralph Tudor",
                inline: "Select the identity verification statement for Ralph Tudor"
            });

        });
    });

});

import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { IndividualStatementHandler } from "../../../../src/routers/handlers/individual-statement/individualStatement";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PSC_INDIVIDUAL } from "../../../mocks/psc.mock";
import { INDIVIDUAL_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { VerificationStatement } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";

jest.mock("../../../../src/services/pscService", () => ({
    getPscIndividual: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: PSC_INDIVIDUAL
    })
}));

describe("Individual statement handler", () => {
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
                    pscType: "individual"
                }
            });
            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_RESOURCE } });
            const handler = new IndividualStatementHandler();
            const expectedPrefix = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}`;

            const resp = await handler.executeGet(req, res);

            expect(resp.templatePath).toBe("router_views/individual_statement/individual_statement");
            expect(resp.viewData).toMatchObject({
                currentUrl: `${expectedPrefix}/individual/psc-statement?lang=en`,
                selectedStatements: [VerificationStatement.INDIVIDUAL_VERIFIED],
                pscName: "Sir Forename Middlename Surname",
                dateOfBirth: "April 2000",
                errors: {}
            });
        });
    });

    describe("executePost", () => {
        it.skip("skip until there's something to test: should patch the submission data", async () => {
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
                    psc_individual_statement: VerificationStatement.INDIVIDUAL_VERIFIED
                }
            });
            const res = httpMocks.createResponse();
            const handler = new IndividualStatementHandler();

            const resp = await handler.executePost(req, res);

        // TODO: add expects here when ready...
        // expect(patchPscVerification).toHaveBeenCalledWith(req, ...)
        });

    });
});

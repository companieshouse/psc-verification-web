import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_CREATED, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import * as httpMocks from "node-mocks-http";
import { PscTypeHandler } from "../../../../src/routers/handlers/psc-type/pscTypeHandler";
import { Urls } from "../../../../src/constants";

describe("psc type handler", () => {
    describe("executeGet", () => {

        it("should return the correct template path", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_TYPE
            });

            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_CREATED } });
            const handler = new PscTypeHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect(templatePath).toBe("router_views/psc_type/psc_type");
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
                    lang: "en"
                }
            });

            const res = httpMocks.createResponse({ locals: { submission: INDIVIDUAL_VERIFICATION_CREATED } });
            const handler = new PscTypeHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect(viewData).toMatchObject({
                title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
                backURL: `/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en&pscType=undefined`,
                currentUrl: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/psc-type?lang=en&pscType=undefined`
            });

        });
    });

    describe("executePost", () => {
        it("should return the correct next page", async () => {

            const req = httpMocks.createRequest({
                method: "POST",
                url: Urls.PSC_TYPE,
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

            const res = httpMocks.createResponse({});
            const handler = new PscTypeHandler();

            const model = await handler.executePost(req, res);

            expect(model.viewData.nextPageUrl).toBe(`/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/psc-list?lang=en&pscType=individual`);
        });
    });
});

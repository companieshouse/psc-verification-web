import { HttpStatusCode } from "axios";
import { COMPANY_NUMBER, CREATED_RESOURCE, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../../../mocks/pscVerification.mock";
import { getPscVerification } from "../../../../src/services/pscVerificationService";
import * as httpMocks from "node-mocks-http";
import { PscTypeHandler } from "../../../../src/routers/handlers/psc-type/pscTypeHandler";
import { Urls } from "../../../../src/constants";

jest.mock("../../../../src/services/pscVerificationService", () => ({
    getPscVerification: () => ({
        httpStatusCode: HttpStatusCode.Ok,
        resource: CREATED_RESOURCE
    })
}));

const mockGetPscVerification = getPscVerification as jest.Mock;

describe("start handler", () => {
    describe("executeGet", () => {

        it("should return the correct template path", async () => {
            const req = httpMocks.createRequest({
                method: "GET",
                url: Urls.PSC_TYPE
            });

            const res = httpMocks.createResponse({});
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

            const res = httpMocks.createResponse({});
            const handler = new PscTypeHandler();

            const { templatePath, viewData } = await handler.executeGet(req, res);

            expect(viewData).toMatchObject({
                title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
                backURL: `/persons-with-significant-control-verification/confirm-company?companyNumber=${COMPANY_NUMBER}&lang=en&pscType=undefined`,
                currentUrl: `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/psc-type?companyNumber=${COMPANY_NUMBER}&lang=en&pscType=undefined`
            });

        });
    });

    // it.each([[undefined, undefined], ["individual", "pscType=individual"], ["rle", "pscType=rle"]])("Should render the Psc Type page with a success status code and %s radio button checked", async (expectedSelection, expectedQuery) => {
    //     const queryParams = new URLSearchParams(expectedQuery);
    //     const uriWithQuery = `${PrefixedUrls.PSC_TYPE}?${queryParams}`;
    //     const uri = getUrlWithTransactionIdAndSubmissionId(uriWithQuery, TRANSACTION_ID, PSC_VERIFICATION_ID);

    //     const resp = await request(app).get(uri);

    //     const $ = cheerio.load(resp.text);

    //     expect(resp.status).toBe(HttpStatusCode.Ok);
    //     expect($("input[name=pscType]:checked").val()).toBe(expectedSelection);
    // });

});

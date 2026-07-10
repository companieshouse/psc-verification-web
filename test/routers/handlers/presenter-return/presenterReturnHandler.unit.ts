import * as httpMocks from "node-mocks-http";
import { PresenterReturnHandler } from "../../../../src/routers/handlers/presenter-return/presenterReturnHandler";
import { TRANSACTION_ID } from "../../../mocks/transaction.mock";
import { PSC_VERIFICATION_ID } from "../../../mocks/pscVerification.mock";
import { PrefixedUrls } from "../../../../src/constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../../src/utils/url";

const SUBMISSION_ID = PSC_VERIFICATION_ID;

describe("PresenterReturnHandler unit tests", () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("Should redirect to the personal-code screen when submissionId query param is present", () => {
        const req = httpMocks.createRequest({
            method: "GET",
            params: { transactionId: TRANSACTION_ID },
            query: { submissionId: SUBMISSION_ID }
        });
        const res = httpMocks.createResponse();

        const handler = new PresenterReturnHandler();
        handler.execute(req, res);

        expect(res._getStatusCode()).toBe(302);
        const expectedUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, TRANSACTION_ID, SUBMISSION_ID);
        expect(res._getRedirectUrl()).toBe(expectedUrl);
    });

    it("Should redirect to service-unavailable when submissionId is missing", () => {
        const req = httpMocks.createRequest({
            method: "GET",
            params: { transactionId: TRANSACTION_ID },
            query: {}
        });
        const res = httpMocks.createResponse();

        const handler = new PresenterReturnHandler();
        handler.execute(req, res);

        expect(res._getStatusCode()).toBe(302);
        expect(res._getRedirectUrl()).toBe("/persons-with-significant-control-verification/service-unavailable");
    });
});

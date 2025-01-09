import { HttpStatusCode } from "axios";
import request from "supertest";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../mocks/authenticationMiddleware.mock";
import mockServiceUnavailableMiddleware from "../mocks/serviceUnavailable.mock";
import mockCsrfProtectionMiddleware from "../mocks/csrfProtectionMiddleware.mock";
import app from "../../src/app";
import { PrefixedUrls } from "../../src/constants";
import { postTransaction } from "../../src/services/transactionService";
import { createPscVerification } from "../../src/services/pscVerificationService";
import { COMPANY_NUMBER, INDIVIDUAL_VERIFICATION_CREATED, PSC_VERIFICATION_ID } from "../mocks/pscVerification.mock";
import { CREATED_PSC_TRANSACTION, TRANSACTION_ID } from "../mocks/transaction.mock";

jest.mock("../../src/services/transactionService");
const mockPostTransaction = postTransaction as jest.Mock;

mockPostTransaction.mockReturnValue(CREATED_PSC_TRANSACTION);

jest.mock("../../src/services/pscVerificationService");
const mockCreatePscVerification = createPscVerification as jest.Mock;
mockCreatePscVerification.mockResolvedValue({
    httpStatusCode: HttpStatusCode.Created,
    resource: INDIVIDUAL_VERIFICATION_CREATED
});

describe("NewSubmission router/handler integration tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockCsrfProtectionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
        expect(mockServiceUnavailableMiddleware).toHaveBeenCalledTimes(1);
    });

    describe("GET method`", () => {

        it.each(["en", "cy"])("Should redirect to the PERSONAL_CODE screen with query param lang=\"%s\"", async (lang) => {
            const expectedRedirectUrl = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/personal-code?lang=${lang}`;

            await request(app).get(PrefixedUrls.NEW_SUBMISSION)
                .query({ companyNumber: `${COMPANY_NUMBER}`, lang })
                .expect(HttpStatusCode.Found)
                .expect("Location", expectedRedirectUrl);
        });
    });
});

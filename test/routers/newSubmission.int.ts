import { HttpStatusCode } from "axios";
import request from "supertest";
import { createHmac } from "crypto";
import mockSessionMiddleware from "../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../mocks/authenticationMiddleware.mock";
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
const base64UrlEncode = (input: string | Buffer): string =>
    Buffer.from(input).toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");

const signPresenterJourneyJwt = (payload: Record<string, string>): string => {
    const encodedHeader = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = base64UrlEncode(
        createHmac("sha256", process.env.CHS_JWT_SECRET as string)
            .update(signingInput)
            .digest()
    );
    return `${signingInput}.${signature}`;
};


describe("NewSubmission router/handler integration tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockCsrfProtectionMiddleware.mockClear();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    describe("GET method`", () => {

        it.each(["en", "cy"])("Should redirect to the presenter journey with returnUrl containing submissionId (lang=\"%s\")", async (lang) => {
            // After our change the handler redirects to the transactions-web presenter journey,
            // not directly to the personal-code screen. The presenter journey parameters are
            // now carried in a JWT signed with CHS_JWT_SECRET rather than as query params.
            const returnUrl = `http://chs.local/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/individual/personal-code`;

            const expectedJwt = signPresenterJourneyJwt({
                companyNumber: COMPANY_NUMBER,
                formType: "VS01",
                returnUrl,
                lang
            });
            const expectedRedirectUrl = `http://chs.local/transaction/${TRANSACTION_ID}/presenter?jwt=${encodeURIComponent(expectedJwt)}`;

            await request(app).get(PrefixedUrls.NEW_SUBMISSION)
                .query({ companyNumber: `${COMPANY_NUMBER}`, lang })
                .expect(HttpStatusCode.Found)
                .expect("Location", expectedRedirectUrl);
        });
    });
});

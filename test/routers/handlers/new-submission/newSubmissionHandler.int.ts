import { HttpStatusCode } from "axios";
import request from "supertest";
import mockSessionMiddleware from "../../../mocks/sessionMiddleware.mock";
import mockAuthenticationMiddleware from "../../../mocks/authenticationMiddleware.mock";
import app from "../../../../src/app";
import { PrefixedUrls } from "../../../../src/constants";
import { postTransaction } from "../../../../src/services/transactionService";
import { createPscVerification } from "../../../../src/services/pscVerificationService";
import { COMPANY_NUMBER, CREATED_RESOURCE, PSC_VERIFICATION_ID } from "../../../mocks/pscVerification.mock";
import { CREATED_PSC_TRANSACTION, TRANSACTION_ID } from "../../../mocks/transaction.mock";

jest.mock("../../../../src/services/transactionService");
const mockPostTransaction = postTransaction as jest.Mock;

mockPostTransaction.mockReturnValue(CREATED_PSC_TRANSACTION);

jest.mock("../../../../src/services/pscVerificationService");
const mockCreatePscVerification = createPscVerification as jest.Mock;
mockCreatePscVerification.mockResolvedValue({
    httpStatusCode: HttpStatusCode.Created,
    resource: CREATED_RESOURCE
});

describe("new submission handler tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should redirect with a temporary redirect status code", async () => {
        const response = await request(app).get(PrefixedUrls.NEW_SUBMISSION).expect(HttpStatusCode.Found);
    });

    it.each(["en", "cy"])("Should redirect to the psc_type screen with lang query set to %s", async (lang) => {
        const expectedRedirectUrl = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/psc-type?companyNumber=${COMPANY_NUMBER}&lang=${lang}`;
        await request(app).get(PrefixedUrls.NEW_SUBMISSION)
            .query({ companyNumber: `${COMPANY_NUMBER}`, lang: lang })
            .expect("Location", expectedRedirectUrl);
    });
});

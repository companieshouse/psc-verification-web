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
import { addSearchParams } from "../../../../src/utils/queryParams";

jest.mock("../../../../src/services/transactionService");
const mockPostTransaction = postTransaction as jest.Mock;

mockPostTransaction.mockReturnValue(CREATED_PSC_TRANSACTION);

jest.mock("../../../../src/services/pscVerificationService");
const mockCreatePscVerification = createPscVerification as jest.Mock;
mockCreatePscVerification.mockResolvedValue({
    httpStatusCode: HttpStatusCode.Created,
    resource: CREATED_RESOURCE
});

const lang = "en";
const createNewSubmissionUrl: string = addSearchParams(PrefixedUrls.NEW_SUBMISSION, { COMPANY_NUMBER, lang });

describe("new submission handler tests", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    afterEach(() => {
        expect(mockSessionMiddleware).toHaveBeenCalledTimes(1);
        expect(mockAuthenticationMiddleware).toHaveBeenCalledTimes(1);
    });

    it("Should redirect with a temporary redirect status code", async () => {
        const response = await request(app).get(createNewSubmissionUrl).expect(HttpStatusCode.Found);
    });

    it("Should redirect to the psc_type screen", async () => {
        const expectedRedirectUrl = `/persons-with-significant-control-verification/transaction/${TRANSACTION_ID}/submission/${PSC_VERIFICATION_ID}/psc-type?lang=en`;
        const response = await request(app).get(createNewSubmissionUrl).expect("Location", expectedRedirectUrl);
    });
});

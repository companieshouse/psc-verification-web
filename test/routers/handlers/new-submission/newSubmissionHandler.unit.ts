import { HttpStatusCode } from "axios";
import * as httpMocks from "node-mocks-http";
import { Urls } from "../../../../src/constants";
import { NewSubmissionHandler } from "../../../../src/routers/handlers/new-submission/newSubmissionHandler";
import { postTransaction } from "../../../../src/services/transactionService";
import { createPscVerification } from "../../../../src/services/pscVerificationService";
import { CREATED_PSC_TRANSACTION } from "../../../mocks/transaction.mock";
import middlewareMocks from "../../../mocks/allMiddleware.mock";
import { PscVerification } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { COMPANY_NUMBER, CREATED_RESOURCE } from "../../../mocks/pscVerification.mock";

jest.mock("../../../../src/services/transactionService");
const mockPostTransaction = postTransaction as jest.Mock;
mockPostTransaction.mockResolvedValue({
    transaction: CREATED_PSC_TRANSACTION
});

jest.mock("../../../../src/services/pscVerificationService");
const mockCreatePscVerification = createPscVerification as jest.Mock;
mockCreatePscVerification.mockResolvedValue({
    httpStatusCode: HttpStatusCode.Created,
    resource: CREATED_RESOURCE
});

const request = httpMocks.createRequest({
    method: "GET",
    url: Urls.NEW_SUBMISSION,
    query: {
        companyNumber: COMPANY_NUMBER
    }
});

const response = httpMocks.createResponse({ locals: {} });

describe("new submission handler tests", () => {

    beforeEach(() => {
        middlewareMocks.mockSessionMiddleware.mockClear();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe("execute", () => {
        it("Should create a new transaction", async () => {

            const handler = new NewSubmissionHandler();

            // when
            await handler.execute(request, response);

            // then
            expect(mockPostTransaction).toHaveBeenCalledTimes(1);
            expect(mockPostTransaction).toHaveBeenCalledWith(request);
        });

        it("Should create a new psc verification submission", async () => {
            const verification: PscVerification = {
                company_number: COMPANY_NUMBER
            };

            const handler = new NewSubmissionHandler();

            // when
            await handler.execute(request, response);

            // then
            expect(mockCreatePscVerification).toHaveBeenCalledTimes(1);
            expect(mockCreatePscVerification).toHaveBeenCalledWith(request, expect.objectContaining({ transaction: CREATED_PSC_TRANSACTION }), expect.objectContaining({ company_number: COMPANY_NUMBER }));
        });
    });
});

import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { postTransaction } from "../../src/services/transactionService";
import { COMPANY_NUMBER, PSC_TRANSACTION } from "../mocks/transaction.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();

mockCreateOAuthApiClient.mockReturnValue({
    transaction: {
        postTransaction: mockPostTransaction
    }
});

describe("Transaction service test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("postTransaction should return created resource on success", async () => {
        const mockResponse: ApiResponse<Transaction> = {
            httpStatusCode: HttpStatusCode.Created,
            resource: PSC_TRANSACTION
        };
        mockPostTransaction.mockResolvedValueOnce(mockResponse as ApiResponse<Transaction>);
        const req = {} as Request;
        req.query = { companyNumber: COMPANY_NUMBER };

        const response = await postTransaction(req);

        expect(response).toEqual(PSC_TRANSACTION);
        expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
        expect(mockPostTransaction).toHaveBeenCalledTimes(1);
    });
});

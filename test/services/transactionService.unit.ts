import Resource from "@companieshouse/api-sdk-node/dist/services/resource";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { HttpStatusCode } from "axios";
import { Request } from "express";
import { createOAuthApiClient } from "../../src/services/apiClientService";
import { DESCRIPTION, TransactionStatus, closeTransaction, postTransaction, putTransaction } from "../../src/services/transactionService";
import { CLOSED_PSC_TRANSACTION, COMPANY_NUMBER, CREATED_PSC_TRANSACTION, OPEN_PSC_TRANSACTION, PSC_VERIFICATION_ID, TRANSACTION_ID } from "../mocks/transaction.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("../../src/services/apiClientService");

const mockCreateOAuthApiClient = createOAuthApiClient as jest.Mock;
const mockPostTransaction = jest.fn();
const mockPutTransaction = jest.fn();
const mockCloseTransaction = jest.fn();

mockCreateOAuthApiClient.mockReturnValue({
    transaction: {
        postTransaction: mockPostTransaction,
        putTransaction: mockPutTransaction,
        closeTransaction: mockCloseTransaction
    }
});

describe("Transaction service", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("postTransaction", () => {
        afterEach(() => {
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockPostTransaction).toHaveBeenCalledTimes(1);
        });

        it("should resolve created resource on success", async () => {
            mockPostTransaction.mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.Created,
                resource: CREATED_PSC_TRANSACTION
            } as Resource<Transaction>);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            const response = await postTransaction(req);

            expect(response).toEqual(CREATED_PSC_TRANSACTION);
        });

        it("should reject when no response from transaction service", async () => {
            mockPostTransaction.mockResolvedValueOnce(undefined);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            await expect(postTransaction(req)).rejects.toBeUndefined();
        });

        it.each([400, 404, undefined])("should reject when response from transaction service has status %p", async (status) => {
            const mockResponse = {
                httpStatusCode: status as number
            };
            mockPostTransaction.mockResolvedValueOnce(mockResponse);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            await expect(postTransaction(req)).rejects.toBe(mockResponse);
        });

        it("should reject when response from transaction service has no resource", async () => {
            const mockResponse = {
                httpStatusCode: HttpStatusCode.Ok,
                resource: undefined
            };
            mockPostTransaction.mockResolvedValueOnce(mockResponse);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            await expect(postTransaction(req)).rejects.toBe(mockResponse);
        });

    });

    describe("putTransaction", () => {
        afterEach(() => {
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockPutTransaction).toHaveBeenCalledTimes(1);
        });

        it("should resolve on success", async () => {
            mockPutTransaction.mockResolvedValueOnce({
                httpStatusCode: HttpStatusCode.NoContent
            } as Resource<Transaction>);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            await expect(putTransaction(req, TRANSACTION_ID, DESCRIPTION, TransactionStatus.OPEN, PSC_VERIFICATION_ID)).resolves.toBeDefined();

            expect(mockPutTransaction).toHaveBeenCalledWith(OPEN_PSC_TRANSACTION);
        });

        it("should reject when no response from transaction service", async () => {
            mockPutTransaction.mockResolvedValueOnce(undefined);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            await expect(putTransaction(req, TRANSACTION_ID, DESCRIPTION, TransactionStatus.OPEN, PSC_VERIFICATION_ID)).rejects.toBeUndefined();
        });

        it.each([400, 404, undefined])("should reject when response from transaction service has status %p", async (status) => {
            const mockResponse = {
                httpStatusCode: status as number
            };
            mockPutTransaction.mockResolvedValueOnce(mockResponse);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            await expect(putTransaction(req, TRANSACTION_ID, DESCRIPTION, TransactionStatus.OPEN, PSC_VERIFICATION_ID)).rejects.toBe(mockResponse);
        });
    });

    describe("closeTransaction", () => {
        afterEach(() => {
            expect(mockCreateOAuthApiClient).toHaveBeenCalledTimes(1);
            expect(mockPutTransaction).toHaveBeenCalledTimes(1);
        });

        it("should resolve on success", async () => {
            const mockResponse = {
                httpStatusCode: HttpStatusCode.NoContent
            };
            mockPutTransaction.mockResolvedValueOnce(mockResponse as Resource<Transaction>);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            await expect(closeTransaction(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).resolves.toBe(mockResponse);

            expect(mockPutTransaction).toHaveBeenCalledWith(CLOSED_PSC_TRANSACTION);
        });

        it("should reject when no response from transaction service", async () => {
            mockPutTransaction.mockResolvedValueOnce(undefined);
            const req = {} as Request;
            req.query = { companyNumber: COMPANY_NUMBER };

            await expect(closeTransaction(req, TRANSACTION_ID, PSC_VERIFICATION_ID)).rejects.toBeUndefined();
        });

    });
});

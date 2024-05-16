import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { DESCRIPTION, REFERENCE, TransactionStatus } from "../../src/services/transactionService";

export const TRANSACTION_ID = "11111-22222-33333";
export const COMPANY_NUMBER = "12345678";
export const PSC_VERIFICATION_ID = "662a0de6a2c6f9aead0f32ab";

export const CREATED_PSC_TRANSACTION = {
    id: TRANSACTION_ID,
    reference: REFERENCE,
    description: DESCRIPTION
} as Transaction;

export const OPEN_PSC_TRANSACTION = {
    id: TRANSACTION_ID,
    reference: [REFERENCE, PSC_VERIFICATION_ID].join("_"),
    description: DESCRIPTION,
    status: TransactionStatus.OPEN
} as Transaction;

export const CLOSED_PSC_TRANSACTION = {
    id: TRANSACTION_ID,
    reference: [REFERENCE, PSC_VERIFICATION_ID].join("_"),
    description: DESCRIPTION,
    status: TransactionStatus.CLOSED
} as Transaction;

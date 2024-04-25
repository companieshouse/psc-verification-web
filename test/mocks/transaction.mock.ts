import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

export const TRANSACTION_ID = "11111-22222-33333";

export const PSC_TRANSACTION = {
    id: TRANSACTION_ID,
    reference: "PscVerificationReference",
    description: "PSC Verification Transaction"
} as Transaction;

import { Request, Response } from "express";
import logger from "../../../lib/Logger";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { postTransaction } from "../../../services/internal/transaction.service";

interface CreateTransaction {
}

export class CreateTransactionHandler {

    public async executeGet (req: Request, _response: Response): Promise<Transaction> {
        logger.info(`CreateTransactionHandler execute called`);

        const companyNumber = req.query.companyNumber as string;
        const DESCRIPTION = "PSC Verification Transaction";
        const REFERENCE = "PscVerificationReference";

        const transaction: Transaction = await postTransaction(companyNumber, DESCRIPTION, REFERENCE);

        return transaction;
    }
}

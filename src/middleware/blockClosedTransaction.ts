import { logger } from "../lib/logger";
import { TransactionStatus, getTransaction } from "../services/transactionService";

/**
 * Middleware to block requests that contain transaction ID if said transaction is already closed.
 * Allows requests to the psc-verified screen without blocking.
 *
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @param next - The next middleware function in the request-response cycle.
 */
export const blockClosedTransaction = (req: any, res: any, next: any) => {
    const transactionId = req.params.transactionId || req.query.transactionId;

    // Skip the middleware for the psc-verified screen
    if (req.path.includes("psc-verified")) {
        return next();
    }

    getTransaction(req, transactionId)
        .then(transaction => {
            if (transaction.status === TransactionStatus.CLOSED) {
                logger.debug(`${transactionId} - Transaction is closed. Blocking request.`);
                const err = new Error("Transaction is closed");
                return next(err);
            }
        })
        .catch(err => {
            logger.error(`${transactionId} - Error while checking transaction status. ${err}`);
            return next(err);
        });

    next();
};

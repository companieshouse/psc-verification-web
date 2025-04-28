import { HttpStatusCode } from "axios";
import { HttpError } from "../lib/errors/httpError";
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
                const httpError = new HttpError("Transaction is closed; blocking request", HttpStatusCode.NotFound);
                return next(httpError);
            }
        })
        .catch(err => {
            logger.error(`${transactionId} - Error while checking transaction status. ${err}`);
            const httpError = new HttpError(err, HttpStatusCode.InternalServerError);
            return next(httpError);
        });

    next();
};

import { HttpStatusCode } from "axios";
import { HttpError } from "../lib/errors/httpError";
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

    (async function checkTransactionStatus () {
        try {
            const transaction = await getTransaction(req, transactionId);
            if (transaction.status === TransactionStatus.CLOSED) {
                const httpError = new HttpError("Transaction is closed; blocking request", HttpStatusCode.NotFound);
                return next(httpError);
            } else {
                return next();
            }
        } catch (err: unknown) {
            if ((err instanceof HttpError && err.status === HttpStatusCode.Unauthorized)) {
                return next(new HttpError(`User not authorized owner for transactionId="${transactionId}"`, HttpStatusCode.NotFound));
            }
            const errorMessage = err instanceof Error ? err.message : `failed to check transaction status for transactionId="${transactionId}"`;
            const httpError = new HttpError(errorMessage, HttpStatusCode.InternalServerError);
            return next(httpError);
        }
    })();

};

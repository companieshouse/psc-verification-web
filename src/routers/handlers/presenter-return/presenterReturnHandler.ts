import { Request, Response } from "express";
import { logger } from "../../../lib/logger";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { PrefixedUrls } from "../../../constants";

/**
 * Receives the redirect back from transactions-web after the presenter identity
 * journey is complete.
 *
 * At this point the presenter data has been saved onto the transaction.
 * The handler resumes the PSC verification journey by redirecting the user
 * to the personal-code step. The submission ID is retrieved from the query
 * parameter that the calling code placed on the return URL.
 *
 * Route: GET /persons-with-significant-control-verification/presenter-return/:transactionId
 */
export class PresenterReturnHandler {

    public execute (req: Request, res: Response): void {
        const transactionId = req.params.transactionId as string;
        const submissionId = req.query.submissionId as string | undefined;

        logger.info(`Presenter return received for transactionId="${transactionId}"`);

        if (!submissionId) {
            logger.error(`No submissionId query param on presenter return for transaction ${transactionId}`);
            res.redirect("/persons-with-significant-control-verification/service-unavailable");
            return;
        }

        const nextUrl = getUrlWithTransactionIdAndSubmissionId(
            PrefixedUrls.PERSONAL_CODE,
            transactionId,
            submissionId
        );

        logger.info(`Redirecting to personal code step: ${nextUrl}`);
        res.redirect(nextUrl);
    }
}

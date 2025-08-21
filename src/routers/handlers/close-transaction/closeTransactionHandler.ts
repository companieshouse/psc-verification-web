import { Request, Response } from "express";
import { closeTransaction as closeTransactionService } from "../../../services/transactionService";
import { logger } from "../../../lib/logger";
import { addSearchParams } from "../../../utils/queryParams";
import { PrefixedUrls } from "../../../constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { selectLang } from "../../../middleware/localise";

export class CloseTransactionHandler {

    public async execute (req: Request, res: Response): Promise<string> {
        logger.info(`called for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"`);

        const companyNumber = req.query.companyNumber as string;
        const lang = selectLang(req.query.lang);

        await this.closeTransaction(req);

        const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, req.params?.transactionId, req.params?.submissionId);
        // send the redirect
        return addSearchParams(nextPageUrl, { companyNumber, lang });
    }

    public async closeTransaction (req: Request): Promise<void> {
        await closeTransactionService(req, req.params.transactionId, req.params.submissionId)
            .then(() => {
                logger.info(`transaction closed successfully for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"`);
            })
            .catch((err) => {
                const message = err.message ? `: ${err.message}` : "";
                throw new Error(`failed to close transaction for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"${message}`);
            });
    }
}

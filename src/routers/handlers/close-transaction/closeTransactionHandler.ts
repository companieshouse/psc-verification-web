import { Request, Response } from "express";
import { closeTransaction as closeTransactionService } from "../../../services/transactionService";
import { logger } from "../../../lib/logger";
import { addSearchParams } from "../../../utils/queryParams";
import { PrefixedUrls } from "../../../constants";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { selectLang } from "../../../middleware/localise";

export class CloseTransactionHandler {

    public async execute (req: Request, res: Response): Promise<string> {

        const submissionId = (typeof req.params?.submissionId === "string") ? req.params?.submissionId : req.params?.submissionId?.[0];
        const transactionId = (typeof req.params?.transactionId === "string") ? req.params?.transactionId : req.params?.transactionId?.[0];

        logger.info(`called for transactionId="${transactionId}", submissionId="${submissionId}"`);

        const companyNumber = req.query.companyNumber as string;
        const lang = selectLang(req.query.lang);

        await this.closeTransaction(req, transactionId, submissionId);

        const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, transactionId, submissionId);
        // send the redirect
        return addSearchParams(nextPageUrl, { companyNumber, lang });
    }

    public async closeTransaction (req: Request, transactionId: string, submissionId: string): Promise<void> {
        await closeTransactionService(req, transactionId, submissionId)
            .then(() => {
                logger.info(`transaction closed successfully for transactionId="${transactionId}", submissionId="${submissionId}"`);
            })
            .catch((err) => {
                const message = err.message ? `: ${err.message}` : "";
                throw new Error(`failed to close transaction for transactionId="${transactionId}", submissionId="${submissionId}"${message}`);
            });
    }
}

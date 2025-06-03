import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { getPscVerification } from "../services/pscVerificationService";
import { handleExceptions } from "../utils/asyncHandler";

export const fetchVerification = handleExceptions(async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.submissionId;
    const transactionId = req.params.transactionId;

    if (transactionId && resourceId) {
        logger.debug(`Retrieving verification: transactionId="${transactionId}", resourceId="${resourceId}"`);

        const response = await getPscVerification(req, transactionId, resourceId);
        // store the submission in the res.locals (per express SOP)
        res.locals.submission = response.resource;
    } else {
        logger.error(`No transactionId or resourceId found in request path parameters`);
    }
    next();
});

import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { getPscVerification } from "../services/pscVerificationService";

export const fetchVerification = async (req: Request, res: Response, next: NextFunction) => {
    const resourceId = req.params.submissionId;
    const transactionId = req.params.transactionId;

    if (transactionId && resourceId) {
        logger.debug(`Retrieving verification resourceID ${resourceId} ...`);

        const response = await getPscVerification(req, transactionId, resourceId);
        // store the submission in the request.locals (per express SOP)
        res.locals.submission = response.resource;
    } else {
        logger.error("No transactionId or submissionId found in request path parameters");
    }
    next();
};

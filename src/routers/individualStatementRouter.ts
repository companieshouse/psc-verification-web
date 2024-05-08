import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls, Urls } from "../constants";
import { logger } from "../lib/logger";
import { authenticate } from "../middleware/authentication";
import { getPscIndividual } from "../services/pscService";
import { getPscVerification } from "../services/pscVerificationService";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { addSearchParams } from "../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { IndividualStatementHandler } from "./handlers/individual-statement/individualStatement";

const router: Router = Router();

router.param("submissionId", async (req, res, next, submissionId) => {
    logger.debug(`Resolved :submissionId=${req.params.submissionId}, retrieving submission resource...`);
    const verificationResponse = await getPscVerification(req, req.params.transactionId, req.params.submissionId);
    // store the submission in the request.locals (per express SOP)
    res.locals.submission = verificationResponse.resource;

    const pscDetailsResponse = await getPscIndividual(req, verificationResponse.resource?.data.company_number as string,
                                                verificationResponse.resource?.data.psc_appointment_id as string);
    res.locals.pscDetails = pscDetailsResponse.resource;
    next();
});

router.get(Urls.INDIVIDUAL_STATEMENT, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new IndividualStatementHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post(Urls.INDIVIDUAL_STATEMENT, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const lang = selectLang(req.body.lang);

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, req.params.transactionId, req.params.submissionId);
    res.redirect(addSearchParams(nextPageUrl, { lang }));
}));

export default router;

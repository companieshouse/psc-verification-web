import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls, Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { addSearchParams } from "../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { PscTypeHandler } from "./handlers/psc-type/pscType";
import { logger } from "../lib/logger";
import { getPscVerification } from "../services/pscVerificationService";

const router: Router = Router();

router.param("submissionId", async (req, res, next, submissionId) => {
    logger.debug(`Resolved :submissionId=${req.params.submissionId}, retrieving submission resource...`);
    const response = await getPscVerification(req, req.params.transactionId, req.params.submissionId);
    // store the submission in the request.locals (per express SOP)
    res.locals.submission = response.resource;
    next();
});

router.get(Urls.PSC_TYPE, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    const params = await handler.executeGet(req, res);

    logger.debug(`submission retrieved: ${JSON.stringify(params.viewData.submission)}`);
    if (params.templatePath && params.viewData) {
        res.render(params.templatePath, params.viewData);
    }
}));

router.post(Urls.PSC_TYPE, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const lang = selectLang(req.body.lang);

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, req.params.transactionId, req.params.submissionId);
    res.redirect(addSearchParams(nextPageUrl, { lang }));
}));

export default router;

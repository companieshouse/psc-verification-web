import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls, Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { PscTypeHandler } from "./handlers/psc-type/pscType";
import { logger } from "../lib/logger";
import { getPscVerification } from "../services/pscVerificationService";

const router: Router = Router();

router.param("submissionId", async (req, res, next, submissionId) => {
    // TODO: no need to retrieve the submission data for this screen:
    // 1) the PSC Type is not stored in the database explicitly
    // 2) selection of PSC type on this screen is captured by request query param 'pscType'
    // 3) this code is left here for now, should be moved to routers for screens that require the submission data
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
    const queryParams = new URLSearchParams(req.url.split("?")[1]);

    queryParams.set("lang", lang);
    queryParams.set("pscType", req.body.pscType);

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, req.params.transactionId, req.params.submissionId);
    res.redirect(`${nextPageUrl}?${queryParams}`);
}));

export default router;

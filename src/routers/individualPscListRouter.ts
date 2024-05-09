import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls, Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { addSearchParams } from "../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { IndividualPscListHandler } from "./handlers/individual-psc-list/individualPscListHandler";
const router: Router = Router();

router.get(Urls.INDIVIDUAL_PSC_LIST, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualPscListHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post(Urls.INDIVIDUAL_PSC_LIST, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const lang = selectLang(req.body.lang);
    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, req.params.transactionId, req.params.submissionId);
    res.redirect(addSearchParams(nextPageUrl, { lang }));
}));

export default router;

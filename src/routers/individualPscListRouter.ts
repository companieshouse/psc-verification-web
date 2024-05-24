import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls, Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { IndividualPscListHandler } from "./handlers/individual-psc-list/individualPscListHandler";

const router: Router = Router();

router.get(Urls.INDIVIDUAL_PSC_LIST, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualPscListHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post(Urls.INDIVIDUAL_PSC_LIST, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualPscListHandler();
    await handler.executePost(req, res);

    const lang = selectLang(req.body.lang);
    const queryParams = new URLSearchParams(req.url.split("?")[1]);
    queryParams.set("lang", lang);

    if (req.params.transactionId && req.params.submissionId && req.body.pscId) {
        const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, req.params.transactionId, req.params.submissionId);
        res.redirect(`${nextPageUrl}?${queryParams}`);
    }
}));

export default router;

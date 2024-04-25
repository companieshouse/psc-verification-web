import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls, Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { PersonalCodeHandler } from "./handlers/personal-code/personalCode";
import { selectLang } from "../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { addSearchParams } from "../utils/queryParams";

const router: Router = Router();

router.get(Urls.PERSONAL_CODE, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new PersonalCodeHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post(Urls.PERSONAL_CODE, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const lang = selectLang(req.body.lang);

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, req.params.transactionId, req.params.submissionId);
    res.redirect(addSearchParams(nextPageUrl, { lang }));
}));

export default router;

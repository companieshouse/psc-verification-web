import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls } from "../constants";
import { handleExceptions } from "../utils/asyncHandler";
import { PersonalCodeHandler } from "./handlers/personal-code/personalCodeHandler";
import { selectLang } from "../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { addSearchParams } from "../utils/queryParams";

const personalCodeRouter: Router = Router({ mergeParams: true });

personalCodeRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new PersonalCodeHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

personalCodeRouter.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PersonalCodeHandler();
    await handler.executePost(req, res);

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, req.params.transactionId, req.params.submissionId);
    const lang = selectLang(req.query.lang);
    res.redirect(addSearchParams(nextPageUrl, { lang }));
}));

export default personalCodeRouter;

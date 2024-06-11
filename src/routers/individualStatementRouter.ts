import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls } from "../constants";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { addSearchParams } from "../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { IndividualStatementHandler } from "./handlers/individual-statement/individualStatement";

const individualStatementRouter: Router = Router({ mergeParams: true });

individualStatementRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new IndividualStatementHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

individualStatementRouter.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualStatementHandler();
    await handler.executePost(req, res);

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, req.params.transactionId, req.params.submissionId);
    const lang = selectLang(req.query.lang);
    res.redirect(addSearchParams(nextPageUrl, { lang }));
}));

export default individualStatementRouter;

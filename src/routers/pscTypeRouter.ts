import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls } from "../constants";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { addSearchParams } from "../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { PscTypeHandler } from "./handlers/psc-type/pscType";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    const params = await handler.executeGet(req, res);

    if (params.templatePath && params.viewData) {
        res.render(params.templatePath, params.viewData);
    }
}));

router.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const lang = selectLang(req.body.lang);

    const transactionIdRegex = "/transaction/(.*)/submission";
    const submissionIdRegex = "/submission/(.*)/";
    const transactionId = req.baseUrl.match(transactionIdRegex);
    const submissionId = req.baseUrl.match(submissionIdRegex);

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, transactionId![1], submissionId![1]);
    res.redirect(addSearchParams(nextPageUrl, { lang }));
}));

export default router;

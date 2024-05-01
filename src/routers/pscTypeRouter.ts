import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls, Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { addSearchParams } from "../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { PscTypeHandler } from "./handlers/psc-type/pscType";

const router: Router = Router();

router.get(Urls.PSC_TYPE, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    const params = await handler.executeGet(req, res);

    if (params.templatePath && params.viewData) {
        res.render(params.templatePath, params.viewData);
    }
}));

router.post(Urls.PSC_TYPE, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const lang = selectLang(req.body.lang);
    const selectedType = req.body.pscType;

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(selectPscType(selectedType), req.params.transactionId, req.params.submissionId);
    res.redirect(addSearchParams(nextPageUrl, { lang }));
}));

const selectPscType = (pscType: any): string => {
    switch (pscType) {
    case "individual": return PrefixedUrls.INDIVIDUAL_PSC_LIST;
    case "rle": return PrefixedUrls.RLE_LIST;
    default: return PrefixedUrls.INDIVIDUAL_PSC_LIST;
    }
};

export default router;

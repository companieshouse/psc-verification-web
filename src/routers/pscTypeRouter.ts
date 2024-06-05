import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls } from "../constants";
import { handleExceptions } from "../utils/asyncHandler";
import { selectLang } from "../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../utils/url";
import { PscTypeHandler } from "./handlers/psc-type/pscType";

const router: Router = Router({ mergeParams: true });

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    const params = await handler.executeGet(req, res);

    if (params.templatePath && params.viewData) {
        res.render(params.templatePath, params.viewData);
    }
}));

router.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const lang = selectLang(req.query.lang);
    const selectedType = req.body.pscType;
    const queryParams = new URLSearchParams(req.url.split("?")[1]);

    queryParams.set("lang", lang);
    queryParams.set("pscType", req.body.pscType);

    const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(selectPscType(selectedType), req.params.transactionId, req.params.submissionId);
    res.redirect(`${nextPageUrl}?${queryParams}`);
}));

// TODO update default when error page available.
const selectPscType = (pscType: any): string => {
    switch (pscType) {
    case "individual": return PrefixedUrls.INDIVIDUAL_PSC_LIST;
    case "rle": return PrefixedUrls.RLE_LIST;
    default: return PrefixedUrls.INDIVIDUAL_PSC_LIST;
    }
};

export default router;

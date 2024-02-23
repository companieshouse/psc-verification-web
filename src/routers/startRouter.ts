import { Request, Response, Router, NextFunction } from "express";
import { StartHandler } from "./handlers/start/start";
import { handleExceptions } from "../utils/async.handler";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { selectLang, getLocalesService, getLocaleInfo } from "./../utils/localise";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const handler = new StartHandler();
    const params = handler.execute(req, res);
    // adding language functionality
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    if (params.templatePath && params.viewData) {
        const additionalData = {
            ...getLocaleInfo(locales, lang),
            currentUrl: "/persons-with-significant-control-verification/start"
        };
        res.render(params.templatePath, { ...params.viewData, ...additionalData });
    }
}));

export default router;

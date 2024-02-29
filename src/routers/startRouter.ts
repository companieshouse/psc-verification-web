import { Request, Response, Router, NextFunction } from "express";
import { StartHandler } from "./handlers/start/start";
import { handleExceptions } from "../utils/async.handler";
import { PrefixedUrls } from "./../constants";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { selectLang, getLocalesService, getLocaleInfo } from "./../utils/localise";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const handler = new StartHandler();
    const params = handler.execute(req, res);

    if (params.templatePath && params.viewData) {
        res.render(params.templatePath, params.viewData);
    }
}));

export default router;

import { NextFunction, Request, Response, Router } from "express";
import { PscTypeHandler } from "./handlers/psc_type/psc_type";
import { handleExceptions } from "../utils/async.handler";
import logger from "../lib/Logger";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    const params = await handler.executeGet(req, res);

    if (params.templatePath && params.viewData) {
        res.render(params.templatePath, params.viewData);
    }
}));

export default router;

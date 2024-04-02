import { NextFunction, Request, Response, Router } from "express";
import { IndividualStatementHandler } from "./handlers/individual_statement/individual_statement";
import { handleExceptions } from "../utils/async.handler";
import { logger } from "../lib/Logger";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new IndividualStatementHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

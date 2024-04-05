import { NextFunction, Request, Response, Router } from "express";
import { RleListHandler } from "./handlers/rlePscList/rlePscList";
import { handleExceptions } from "../utils/async.handler";
import { logger } from "../lib/Logger";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new RleListHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

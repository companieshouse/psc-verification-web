import { NextFunction, Request, Response, Router } from "express";
import { SkeletonFourHandler } from "./handlers/skeleton_four";
import { handleExceptions } from "../utils/async.handler";
import logger from "../lib/Logger";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new SkeletonFourHandler();
    const { templatePath, viewData } = handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

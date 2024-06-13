import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { StartHandler } from "./handlers/start/startHandler";

const startRouter: Router = Router();

startRouter.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const handler = new StartHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default startRouter;

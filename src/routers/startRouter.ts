import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import StartHandler from "./handlers/start/startHandler";
import { env } from "../config";

const startRouter: Router = Router();

startRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    if (env.DEPLOYMENT_ENVIRONMENT === "live") {
        res.redirect(env.GDS_START_SCREEN_URL);
    } else {
        const handler = new StartHandler();
        const { templatePath, viewData } = await handler.executeGet(req, res);
        res.render(templatePath, viewData);
    }
}));

export default startRouter;

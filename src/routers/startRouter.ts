import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { StartHandler } from "./handlers/start/start";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const handler = new StartHandler();
    const params = await handler.execute(req, res);

    if (params.templatePath && params.viewData) {
        res.render(params.templatePath, params.viewData);
    }
}));

export default router;

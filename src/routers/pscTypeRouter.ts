import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { PscTypeHandler } from "./handlers/psc-type/pscType";

const router: Router = Router({ mergeParams: true });

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    const params = await handler.execute(req, res);
    res.render(params.templatePath, params.viewData);
}));

router.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    const params = await handler.execute(req, res);
    if (!Object.keys(params.viewData.errors).length) {
        res.redirect(params.viewData.nextPageUrl);
    } else {
        res.render(params.templatePath, params.viewData);
    }
}));

export default router;

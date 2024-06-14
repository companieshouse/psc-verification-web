import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { PscTypeHandler } from "./handlers/psc-type/pscTypeHandler";

const pscTypeRouter: Router = Router({ mergeParams: true });

pscTypeRouter.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

pscTypeRouter.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PscTypeHandler();
    res.redirect(handler.executePost(req, res));
}));

export default pscTypeRouter;

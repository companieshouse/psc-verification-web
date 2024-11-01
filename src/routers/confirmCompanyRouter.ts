import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { ConfirmCompanyHandler } from "./handlers/confirm-company/confirmCompany";

const confirmCompanyRouter: Router = Router({ mergeParams: true });

confirmCompanyRouter.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

confirmCompanyRouter.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const redirectUrl = await handler.executePost(req, res);
    res.redirect(redirectUrl);
}));

export default confirmCompanyRouter;

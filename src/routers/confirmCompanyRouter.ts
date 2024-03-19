import { NextFunction, Request, Response, Router } from "express";
import { ConfirmCompanyHandler } from "./handlers/confirmCompany/confirmCompany";
import { PscTypeHandler } from "./handlers/psc_type/psc_type";
import { handleExceptions } from "../utils/async.handler";
import { PrefixedUrls } from "../constants";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    res.redirect(PrefixedUrls.CREATE_TRANSACTION);
}));

export default router;

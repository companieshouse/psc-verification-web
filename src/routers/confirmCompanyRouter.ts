import { NextFunction, Request, Response, Router } from "express";
import { ConfirmCompanyHandler } from "./handlers/confirmCompany/confirmCompany";
import { handleExceptions } from "../utils/async.handler";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const { templatePath, viewData } = handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

import { NextFunction, Request, Response, Router } from "express";
import { CompanyNumberHandler } from "./handlers/confirmCompany/companyNumber";
import { handleExceptions } from "../utils/async.handler";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new CompanyNumberHandler();
    handler.execute(req, res);
}));

export default router;

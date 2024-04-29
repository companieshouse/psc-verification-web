import { NextFunction, Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { CompanyNumberHandler } from "./handlers/confirm-company/companyNumber";
const router: Router = Router();

router.get(Urls.COMPANY_NUMBER, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new CompanyNumberHandler();
    await handler.execute(req, res);
}));

export default router;

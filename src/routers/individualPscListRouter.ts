import { NextFunction, Request, Response, Router } from "express";
import { Urls } from "../constants";
import { handleExceptions } from "../utils/asyncHandler";
import { IndividualPscListHandler } from "./handlers/individual-psc-list/individualPscList";
import { authenticate } from "../middleware/authentication";
const router: Router = Router();

router.get(Urls.INDIVIDUAL_PSC_LIST, authenticate, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualPscListHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

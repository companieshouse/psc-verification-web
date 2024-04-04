import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/async.handler";
import { IndividualPscListHandler } from "./handlers/individual-psc-list/individualPscList";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualPscListHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

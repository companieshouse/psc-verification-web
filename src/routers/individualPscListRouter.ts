import { NextFunction, Request, Response, Router } from "express";
import { IndividualPscListHandler } from "./handlers/individualPscList/individualPscList";
import { handleExceptions } from "../utils/async.handler";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualPscListHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

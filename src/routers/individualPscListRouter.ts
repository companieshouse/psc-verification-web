import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { IndividualPscListHandler } from "./handlers/individual-psc-list/individualPscListHandler";

const individualPscListRouter: Router = Router({ mergeParams: true });

individualPscListRouter.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualPscListHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default individualPscListRouter;

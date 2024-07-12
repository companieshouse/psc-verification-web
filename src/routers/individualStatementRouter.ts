import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { IndividualStatementHandler } from "./handlers/individual-statement/individualStatementHandler";

const individualStatementRouter: Router = Router({ mergeParams: true });

individualStatementRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new IndividualStatementHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

individualStatementRouter.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualStatementHandler();
    res.redirect(await handler.executePost(req, res));
}));

export default individualStatementRouter;

import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { IndividualStatementHandler } from "./handlers/individual-statement/individualStatementHandler";

const individualStatementRouter: Router = Router({ mergeParams: true });

individualStatementRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new IndividualStatementHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

individualStatementRouter.post("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new IndividualStatementHandler();
    const params = await handler.executePost(req, res);

    if (!Object.keys(params.viewData.errors).length) {
        res.redirect(params.viewData.nextPageUrl);
    } else {
        res.render(params.templatePath, params.viewData);
    }

}));

export default individualStatementRouter;

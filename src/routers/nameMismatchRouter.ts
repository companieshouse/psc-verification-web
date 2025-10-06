import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { NameMismatchHandler } from "./handlers/name-mismatch/nameMismatchHandler";

const nameMismatchRouter: Router = Router({ mergeParams: true });

nameMismatchRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new NameMismatchHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

nameMismatchRouter.post("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new NameMismatchHandler();
    const params = await handler.executePost(req, res);

    if (!Object.keys(params.viewData.errors).length) {
        res.redirect(params.viewData.nextPageUrl);
    } else {
        res.render(params.templatePath, params.viewData);
    }

}));

export default nameMismatchRouter;

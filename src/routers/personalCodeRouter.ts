import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { PersonalCodeHandler } from "./handlers/personal-code/personalCodeHandler";

const personalCodeRouter: Router = Router({ mergeParams: true });

personalCodeRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new PersonalCodeHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

personalCodeRouter.post("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new PersonalCodeHandler();
    const params = await handler.executePost(req, res);

    if (!Object.keys(params.viewData.errors).length) {
        res.redirect(params.viewData.nextPageUrl);
    } else {
        res.render(params.templatePath, params.viewData);
    }

}));

export default personalCodeRouter;

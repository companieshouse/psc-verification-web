import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { PersonalCodeHandler } from "./handlers/personal-code/personalCodeHandler";

const personalCodeRouter: Router = Router({ mergeParams: true });

personalCodeRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new PersonalCodeHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

personalCodeRouter.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new PersonalCodeHandler();
    res.redirect(await handler.executePost(req, res));
}));

export default personalCodeRouter;

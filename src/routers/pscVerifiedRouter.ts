import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { PscVerifiedHandler } from "./handlers/psc-verified/pscVerifiedHandler";
const pscVerifiedRouter: Router = Router({ mergeParams: true });

pscVerifiedRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new PscVerifiedHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default pscVerifiedRouter;

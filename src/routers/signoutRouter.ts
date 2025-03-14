import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import SignoutHandler from "./handlers/signout/signoutHandler";

const signoutRouter: Router = Router();

signoutRouter.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const handler = new SignoutHandler();
    const { viewData } = await handler.executeGet(req, res);

    return res.redirect(viewData.signoutRedirectPath);
}));

export default signoutRouter;

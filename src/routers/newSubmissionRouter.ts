import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { NewSubmissionHandler } from "./handlers/new-submission/newSubmissionHandler";

const newSubmissionRouter: Router = Router({ mergeParams: true });

newSubmissionRouter.all("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new NewSubmissionHandler();
    const redirectUrl = await handler.execute(req, res);
    res.redirect(redirectUrl);
}));

export default newSubmissionRouter;

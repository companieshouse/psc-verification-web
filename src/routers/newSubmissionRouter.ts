import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { NewSubmissionHandler } from "./handlers/new-submission/newSubmissionHandler";

const router: Router = Router({ mergeParams: true });

router.all("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new NewSubmissionHandler();
    await handler.execute(req, res);
}));

export default router;

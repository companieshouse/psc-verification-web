import { Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { NewSubmissionHandler } from "./handlers/new-submission/newSubmissionHandler";
const router: Router = Router();

router.all(Urls.NEW_SUBMISSION, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new NewSubmissionHandler();
    await handler.execute(req, res);
}));

export default router;

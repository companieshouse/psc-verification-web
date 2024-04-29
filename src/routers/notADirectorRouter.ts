import { Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { NotADirectorHandler } from "./handlers/not-a-director/notADirector";
const router: Router = Router();

router.get(Urls.NOT_A_DIRECTOR, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new NotADirectorHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

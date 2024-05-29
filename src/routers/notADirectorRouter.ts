import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { NotADirectorHandler } from "./handlers/not-a-director/notADirector";

const router: Router = Router({ mergeParams: true });

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new NotADirectorHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

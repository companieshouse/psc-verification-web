import { Request, Response, Router } from "express";
import { RleDirectorHandler } from "./handlers/rle-director/rleDirector";
import { handleExceptions } from "../utils/asyncHandler";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new RleDirectorHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

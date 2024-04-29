import { Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { RleDirectorHandler } from "./handlers/rle-director/rleDirector";
const router: Router = Router();

router.get(Urls.RLE_DIRECTOR, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new RleDirectorHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

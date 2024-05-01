import { Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { RleVerifiedHandler } from "./handlers/rle-verified/rleVerified";
const router: Router = Router();

router.get(Urls.RLE_VERIFIED, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new RleVerifiedHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

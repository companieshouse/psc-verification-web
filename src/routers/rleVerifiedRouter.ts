import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { RleVerifiedHandler } from "./handlers/rle-verified/rleVerified";

const router: Router = Router({ mergeParams: true });

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new RleVerifiedHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

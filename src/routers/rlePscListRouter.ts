import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { RleListHandler } from "./handlers/rle-psc-list/rlePscList";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new RleListHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

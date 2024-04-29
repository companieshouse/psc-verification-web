import { Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { PscVerifiedHandler } from "./handlers/psc-verified/pscVerified";
const router: Router = Router();

router.get(Urls.PSC_VERIFIED, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new PscVerifiedHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

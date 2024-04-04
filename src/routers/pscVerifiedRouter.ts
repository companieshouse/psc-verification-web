import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/async.handler";
import { PscVerifiedHandler } from "./handlers/psc-verified/pscVerified";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new PscVerifiedHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

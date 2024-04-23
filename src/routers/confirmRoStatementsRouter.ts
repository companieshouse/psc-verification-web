import { Request, Response, Router } from "express";
import { ConfirmRoStatementsHandler } from "./handlers/confirm-ro-statements/confirmRoStatements";
import { handleExceptions } from "../utils/asyncHandler";
const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new ConfirmRoStatementsHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

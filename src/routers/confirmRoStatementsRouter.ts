import { Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { ConfirmRoStatementsHandler } from "./handlers/confirm-ro-statements/confirmRoStatements";
const router: Router = Router();

router.get(Urls.CONFIRM_RO_STATEMENTS, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new ConfirmRoStatementsHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

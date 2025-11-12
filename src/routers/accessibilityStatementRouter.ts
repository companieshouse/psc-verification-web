import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import AccessibilityStatementHandler from "./handlers/accessibility-statement/accessibilityStatementHandler";

const accessibilityStatementRouter: Router = Router();

accessibilityStatementRouter.get("/", handleExceptions(async (req: Request, res: Response) => {

    const handler = new AccessibilityStatementHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default accessibilityStatementRouter;

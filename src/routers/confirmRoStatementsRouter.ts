import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { ConfirmRoStatementsHandler } from "./handlers/confirm-ro-statements/confirmRoStatements";

const confirmRoStatementsRouter: Router = Router({ mergeParams: true });

confirmRoStatementsRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new ConfirmRoStatementsHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default confirmRoStatementsRouter;

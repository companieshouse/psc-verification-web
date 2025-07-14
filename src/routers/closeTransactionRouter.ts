import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { CloseTransactionHandler } from "./handlers/close-transaction/closeTransactionHandler";

const closeTransactionRouter: Router = Router({ mergeParams: true });

closeTransactionRouter.all("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new CloseTransactionHandler();
    const redirectUrl = await handler.execute(req, res);
    res.redirect(redirectUrl);
}));

export default closeTransactionRouter;

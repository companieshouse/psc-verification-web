import { Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { IndividualStatementHandler } from "./handlers/individual-statement/individualStatement";

const router: Router = Router();

router.get(Urls.INDIVIDUAL_STATEMENT, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new IndividualStatementHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

import { NextFunction, Request, Response, Router } from "express";
import { CreateTransactionHandler } from "./handlers/transaction/createTransaction";
import { PscTypeHandler } from "./handlers/psc_type/psc_type";
import { handleExceptions } from "../utils/async.handler";
import { PrefixedUrls } from "../constants";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new CreateTransactionHandler();
    const { templatePath, viewData } = handler.executeGet(req, res);
    res.render(templatePath, viewData);
    res.redirect(PrefixedUrls.PSC_TYPE + "?lang=" + req.body.lang);
}));

export default router;

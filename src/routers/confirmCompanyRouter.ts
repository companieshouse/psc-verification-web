import { NextFunction, Request, Response, Router } from "express";
import { ConfirmCompanyHandler } from "./handlers/confirmCompany/confirmCompany";
import { handleExceptions } from "../utils/async.handler";
import { PrefixedUrls } from "../constants";
import { postTransaction } from "../services/internal/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const companyNumber = req.query.companyNumber as string;
    const DESCRIPTION = "PSC Verification Transaction";
    const REFERENCE = "PscVerificationReference";

    const transaction: Transaction = await postTransaction(companyNumber, DESCRIPTION, REFERENCE);

    res.redirect(PrefixedUrls.CREATE_TRANSACTION + "?lang=" + req.body.lang);
}));

export default router;

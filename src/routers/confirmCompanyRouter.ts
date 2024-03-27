import { NextFunction, Request, Response, Router } from "express";
import { ConfirmCompanyHandler } from "./handlers/confirmCompany/confirmCompany";
import { handleExceptions } from "../utils/async.handler";
import { PrefixedUrls } from "../constants";
import { postTransaction } from "../services/internal/transaction.service";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { Session } from "@companieshouse/node-session-handler";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const session = req.session as Session;
    const companyNumber = req.query.companyNumber as string;
    const DESCRIPTION = "PSC Verification Transaction";
    const REFERENCE = "PscVerificationReference";

    const transaction: Transaction = await postTransaction(session, companyNumber, DESCRIPTION, REFERENCE);

    res.redirect(PrefixedUrls.PSC_TYPE + "?lang=" + req.body.lang);
}));

export default router;

import { PscVerification } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls } from "../constants";
import { logger } from "../lib/Logger";
import { createPscVerification } from "../services/internal/pscVerificationService";
import { postTransaction } from "../services/internal/transaction.service";
import { handleExceptions } from "../utils/async.handler";
import { selectLang } from "../utils/localise";
import { addSearchParams } from "../utils/queryParams";
import { ConfirmCompanyHandler } from "./handlers/confirmCompany/confirmCompany";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new ConfirmCompanyHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const transaction: Transaction = await postTransaction(req);
    const number = req.query.companyNumber as string;
    const verification: PscVerification = {
        company_number: number,
        psc_appointment_id: "TBC",
        verification_details: {
            verification_statements: []
        }
    };

    const resource = await createPscVerification(req, transaction, verification);
    const lang = selectLang(req.body.lang);
    logger.info("CREATED" + resource);

    res.redirect(addSearchParams(PrefixedUrls.PSC_TYPE, { companyNumber: number, lang }));
}));

export default router;

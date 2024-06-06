import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler } from "../generic";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { postTransaction } from "../../../services/transactionService";
import { PscVerification, PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { createPscVerification } from "../../../services/pscVerificationService";
import { Resource } from "@companieshouse/api-sdk-node";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { addSearchParams } from "../../../utils/queryParams";

export class NewSubmissionHandler extends GenericHandler<BaseViewData> {

    public async execute (req: Request, res: Response) {
        logger.info(`New SubmissionHandler execute called`);
        // create a new transaction
        const transaction: Transaction = await postTransaction(req);
        logger.info(`CREATED Transaction ${transaction.id!} `);

        // create a new submission for the company number provided
        const resource = await this.createNewSubmission(req, transaction);
        logger.info(`CREATED New Resource ${resource?.resource?.links.self} `);

        // set up redirect to psc_type screen
        const lang = selectLang(req.query.lang);
        const regex = "significant-control-verification/(.*)$";
        const resourceId = resource.resource?.links.self.match(regex);
        const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, transaction.id!, resourceId![1]);

        // send the redirect
        const companyNumber = req.query.companyNumber as string;
        return res.redirect(addSearchParams(nextPageUrl, { companyNumber, lang }));

    }

    public async createNewSubmission (request: Request, transaction: Transaction): Promise<Resource<PscVerificationResource>> {
        const companyNumber = request.query.companyNumber as string;
        const verification: PscVerification = {
            company_number: companyNumber
        };
        return createPscVerification(request, transaction, verification);
    }
}

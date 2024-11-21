import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler } from "../generic";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { postTransaction } from "../../../services/transactionService";
import { PscVerification, PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { createPscVerification } from "../../../services/pscVerificationService";
import { Resource } from "@companieshouse/api-sdk-node";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { addSearchParams } from "../../../utils/queryParams";

export class NewSubmissionHandler extends GenericHandler<BaseViewData> {

    public async execute (req: Request, res: Response) {
        logger.info(`${NewSubmissionHandler.name} - ${this.execute.name} called`);
        // create a new transaction
        const transaction: Transaction = await postTransaction(req);
        logger.info(`${NewSubmissionHandler.name} - ${this.execute.name} - CREATED Transaction ${transaction.id!}`);

        // create a new submission for the company number provided
        const resource = await this.createNewSubmission(req, transaction);
        logger.info(`${NewSubmissionHandler.name} - ${this.execute.name} - CREATED New Resource ${resource?.resource?.links.self}`);

        // set up redirect to psc_code screen
        const lang = selectLang(req.query.lang);
        const regex = "significant-control-verification/(.*)$";
        const resourceId = resource.resource?.links.self.match(regex);
        const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, transaction.id!, resourceId![1]);

        // send the redirect
        return addSearchParams(nextPageUrl, { lang });
    }

    public async createNewSubmission (request: Request, transaction: Transaction): Promise<Resource<PscVerification>> {
        const companyNumber = request.query.companyNumber as string;
        const pscAppointmentId = request.query.selectedPscId as string;
        const verification: PscVerificationData = {
            companyNumber: companyNumber,
            pscAppointmentId: pscAppointmentId
        };
        return createPscVerification(request, transaction, verification);
    }
}

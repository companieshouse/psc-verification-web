import { Request, Response } from "express";
import { PrefixedUrls, STOP_TYPE } from "../../../constants";
import { logger } from "../../../lib/logger";
import { selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler } from "../generic";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { postTransaction } from "../../../services/transactionService";
import { PscVerification, PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { createPscVerification } from "../../../services/pscVerificationService";
import { Resource } from "@companieshouse/api-sdk-node";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { addSearchParams } from "../../../utils/queryParams";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";

export class NewSubmissionHandler extends GenericHandler<BaseViewData> {

    public async execute (req: Request, res: Response) {
        logger.info(`${NewSubmissionHandler.name} - ${this.execute.name} called`);
        // create a new transaction
        const transaction: Transaction = await postTransaction(req);
        logger.info(`${NewSubmissionHandler.name} - ${this.execute.name} - CREATED Transaction ${transaction.id!}`);

        // create a new submission for the company number provided
        const resource = await this.createNewSubmission(req, transaction);
        const companyNumber = req.query.companyNumber as string;
        const lang = selectLang(req.query.lang);

        let nextPageUrl : string = "";

        if (this.isErrorResponse(resource)) {

            nextPageUrl = getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.PROBLEM_WITH_PSC_DATA);

        } else {

            const pscVerification = resource.resource;

            logger.info(`${NewSubmissionHandler.name} - ${this.execute.name} - CREATED New Resource ${pscVerification?.links.self}`);

            // set up redirect to psc_code screen
            const regex = "persons-with-significant-control-verification/(.*)$";
            const resourceId = pscVerification?.links.self.match(regex);
            nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, transaction.id!, resourceId![1]);

        }
        // send the redirect
        return addSearchParams(nextPageUrl, { companyNumber, lang });
    }

    public async createNewSubmission (request: Request, transaction: Transaction): Promise<Resource<PscVerification> | ApiErrorResponse> {
        const companyNumber = request.query.companyNumber as string;
        const pscNotificationId = request.query.selectedPscId as string;
        const verification: PscVerificationData = {
            companyNumber: companyNumber,
            pscNotificationId: pscNotificationId
        };
        return createPscVerification(request, transaction, verification);
    }

    public isErrorResponse (obj: any): obj is ApiErrorResponse {
        return obj.httpStatusCode === HttpStatusCode.InternalServerError;
    }

}

import { Request, Response } from "express";
import { PrefixedUrls, STOP_TYPE } from "../../../constants";
import { logger } from "../../../lib/logger";
import { BaseViewData, GenericHandler } from "../generic";
import { Transaction } from "@companieshouse/api-sdk-node/dist/services/transaction/types";
import { postTransaction } from "../../../services/transactionService";
import { PscVerification, PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { createPscVerification } from "../../../services/pscVerificationService";
import { Resource } from "@companieshouse/api-sdk-node";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { addSearchParams } from "../../../utils/queryParams";
import { getPresenterJourneyUrl } from "../../utils";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";
import { env } from "../../../config";

export class NewSubmissionHandler extends GenericHandler<BaseViewData> {

    public async execute (req: Request, res: Response) {
        logger.info(`called`);
        // create a new transaction
        const transaction: Transaction = await postTransaction(req);
        logger.info(`CREATED transaction with transactionId="${transaction.id}"`);

        // create a new submission for the company number provided
        const resource = await this.createNewSubmission(req, transaction);
        const companyNumber = req.query.companyNumber as string;
        const lang = res.locals.lang;

        if (this.isErrorResponse(resource)) {
            const nextPageUrl = getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.PROBLEM_WITH_PSC_DATA);
            return addSearchParams(nextPageUrl, { companyNumber, lang });
        }

        const pscVerification = resource.resource;
        logger.info(`CREATED New Resource ${pscVerification?.links.self}`);

        // Build the return URL that transactions-web will redirect back to after the
        // presenter journey is complete.
        const regex = "persons-with-significant-control-verification/(.*)$";
        const resourceId = pscVerification?.links.self.match(regex);
        const personalCodeUrl = `${env.CHS_URL}${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, transaction.id!, resourceId![1])}`;

        // Redirect to transactions-web to start the presenter identity journey.
        // transactions-web will redirect back to presenterReturnUrl once complete.
        const presenterJourneyUrl = getPresenterJourneyUrl({
            companyNumber,
            formType: "VS01",
            transactionId: transaction.id!,
            returnUrl: personalCodeUrl
        });

        logger.info(`Redirecting to presenter journey: ${presenterJourneyUrl}`);
        return presenterJourneyUrl;
    }

    public async createNewSubmission (request: Request, transaction: Transaction): Promise<Resource<PscVerification> | ApiErrorResponse> {
        const companyNumber = request.query.companyNumber as string;
        const pscNotificationId = request.query.selectedPscId as string;
        const verification: PscVerificationData = {
            companyNumber,
            pscNotificationId
        };
        return createPscVerification(request, transaction, verification);
    }

    public isErrorResponse (obj: any): obj is ApiErrorResponse {
        return obj.httpStatusCode === HttpStatusCode.InternalServerError;
    }

}

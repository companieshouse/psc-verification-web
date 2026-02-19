import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getPscIndividual } from "../../../services/pscService";
import { patchPscVerification } from "../../../services/pscVerificationService";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn } from "../../utils";
import { PscVerificationData, VerificationStatementEnum } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { PscVerificationFormsValidator } from "../../../lib/validation/form-validators/pscVerification";

interface IndividualStatementViewData extends BaseViewData {
    pscName: string,
    selectedStatements: string[],
    dateOfBirth: string,
    selectedPscId: string,
    nextPageUrl: string
}
export class IndividualStatementHandler extends GenericHandler<IndividualStatementViewData> {

    private static readonly templatePath = "router_views/individualStatement/individual-statement";

    public async getViewData (req: Request, res: Response): Promise<IndividualStatementViewData> {

        const baseViewData = await super.getViewData(req, res);
        const submissionId = (typeof req.params?.submissionId === "string") ? req.params?.submissionId : req.params?.submissionId?.[0];
        const transactionId = (typeof req.params?.transactionId === "string") ? req.params?.transactionId : req.params?.transactionId?.[0];
        const verification = res.locals.submission;
        const pscDetailsResponse = await getPscIndividual(req, verification?.data.companyNumber as string, verification?.data.pscNotificationId as string);
        const lang = res.locals.lang;
        const selectedStatements = verification?.data?.verificationDetails?.verificationStatements ?? [];
        const selectedPscId = verification?.data?.pscNotificationId;
        const nameMismatch = verification?.data?.verificationDetails?.nameMismatchReason;

        return {
            ...baseViewData,
            pscName: pscDetailsResponse.resource?.name!,
            selectedStatements,
            dateOfBirth: formatDateBorn(pscDetailsResponse.resource?.dateOfBirth, lang),
            backURL: resolveBackUrl(nameMismatch, transactionId, submissionId),
            templateName: Urls.INDIVIDUAL_STATEMENT,
            selectedPscId
        };

        function resolveBackUrl (nameMismatchReason: any, transactionId: string, submissionId: string): string | null {
            return (!nameMismatchReason) ? resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE, transactionId, submissionId) : resolveUrlTemplate(PrefixedUrls.NAME_MISMATCH, transactionId, submissionId);
        }

        function resolveUrlTemplate (prefixedUrl: string, transactionId: string, submissionId: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, transactionId, submissionId), { lang, selectedPscId });
        }
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<IndividualStatementViewData>> {
        const submissionId = (typeof req.params?.submissionId === "string") ? req.params?.submissionId : req.params?.submissionId?.[0];
        const transactionId = (typeof req.params?.transactionId === "string") ? req.params?.transactionId : req.params?.transactionId?.[0];

        logger.info(`called for transactionId="${transactionId}", submissionId="${submissionId}"`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: IndividualStatementHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, res: Response): Promise<ViewModel<IndividualStatementViewData>> {

        const submissionId = (typeof req.params?.submissionId === "string") ? req.params?.submissionId : req.params?.submissionId?.[0];
        const transactionId = (typeof req.params?.transactionId === "string") ? req.params?.transactionId : req.params?.transactionId?.[0];

        logger.info(`called for transactionId="${transactionId}", submissionId="${submissionId}"`);
        const viewData = await this.getViewData(req, res);

        try {
            const lang = res.locals.lang;
            const statement: VerificationStatementEnum = req.body.pscIndividualStatement; // a single string rather than string[] is returned (because there is only 1 checkbox in the group?)
            const selectedStatements = [statement];

            const verification: PscVerificationData = {
                verificationDetails: {
                    verificationStatements: selectedStatements
                }
            };

            const queryParams = new URLSearchParams(req.url.split("?")[1]);
            queryParams.set("lang", lang);
            queryParams.set("selectedStatements", selectedStatements[0]);

            const validator = new PscVerificationFormsValidator(lang);
            viewData.errors = await validator.validateIndividualStatement(req.body, lang, viewData.pscName);

            queryParams.delete("selectedStatements");
            const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.CLOSE_TRANSACTION, transactionId, submissionId);
            viewData.nextPageUrl = `${nextPageUrl}?${queryParams}`;

            logger.debug(`patching individual verification statement for transactionId="${transactionId}", submissionId="${submissionId}"`);
            await patchPscVerification(req, transactionId, submissionId, verification);

        } catch (err: any) {
            logger.debug(`There was a problem executing ${req.method} for individual verification statement for transactionId="${transactionId}", submissionId="${submissionId}"`);
            viewData.errors = this.processHandlerException(err);
        }

        return {
            templatePath: IndividualStatementHandler.templatePath,
            viewData
        };
    }

}

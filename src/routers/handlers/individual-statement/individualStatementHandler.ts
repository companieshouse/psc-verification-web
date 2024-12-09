import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getPscIndividual } from "../../../services/pscService";
import { patchPscVerification } from "../../../services/pscVerificationService";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
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

    private static templatePath = "router_views/individualStatement/individual-statement";

    public async getViewData (req: Request, res: Response): Promise<IndividualStatementViewData> {

        const baseViewData = await super.getViewData(req, res);
        const verification = res.locals.submission;
        const pscDetailsResponse = await getPscIndividual(req, verification?.data.companyNumber as string, verification?.data.pscAppointmentId as string);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const selectedStatements = verification?.data?.verificationDetails?.verificationStatements || [];
        const selectedPscId = verification?.data?.pscAppointmentId;

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            pscName: pscDetailsResponse.resource?.name!,
            selectedStatements,
            dateOfBirth: formatDateBorn(pscDetailsResponse.resource?.dateOfBirth, selectLang(req.query.lang)),
            currentUrl: resolveUrlTemplate(PrefixedUrls.INDIVIDUAL_STATEMENT),
            backURL: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
            templateName: Urls.INDIVIDUAL_STATEMENT,
            backLinkDataEvent: "psc-statement-back-link",
            selectedPscId: selectedPscId
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { lang, selectedPscId });
        }
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<IndividualStatementViewData>> {
        logger.info(`${IndividualStatementHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: IndividualStatementHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, res: Response): Promise<ViewModel<IndividualStatementViewData>> {
        logger.info(`${IndividualStatementHandler.name} - ${this.executePost.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        try {
            const lang = selectLang(req.query.lang);
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
            const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, req.params.transactionId, req.params.submissionId);
            viewData.nextPageUrl = `${nextPageUrl}?${queryParams}`;

            logger.debug(`${IndividualStatementHandler.name} - ${this.executePost.name} - patching individual verification statement for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
            await patchPscVerification(req, req.params.transactionId, req.params.submissionId, verification);

        } catch (err: any) {
            logger.info(`There was a problem executing ${req.method} for individual verification statement for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
            viewData.errors = this.processHandlerException(err);
        }

        return {
            templatePath: IndividualStatementHandler.templatePath,
            viewData
        };
    }

}

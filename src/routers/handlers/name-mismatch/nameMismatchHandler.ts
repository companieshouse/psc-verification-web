import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn } from "../../utils";
import { NameMismatchReasonEnum, PscVerification, PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { patchPscVerification } from "../../../services/pscVerificationService";
import { getPscIndividual } from "../../../services/pscService";
import { PscVerificationFormsValidator } from "../../../lib/validation/form-validators/pscVerification";

interface NameMismatchViewData extends BaseViewData {
    pscName: string,
    monthYearBorn: string,
    nameMismatch: string,
    nextPageUrl: string,
    legalNameChange: string,
    preferredName: string,
    translationOrDifferentConvention: string,
    publicRegisterError: string,
    preferNotToSay: string
}

export class NameMismatchHandler extends GenericHandler<NameMismatchViewData> {

    private static readonly templatePath = "router_views/nameMismatch/name-mismatch";

    public async getViewData (req: Request, res: Response): Promise<NameMismatchViewData> {

        const baseViewData = await super.getViewData(req, res);
        const verification: PscVerification = res.locals.submission;
        const companyNumber = verification.data.companyNumber as string;
        const pscIndividual = await getPscIndividual(req, companyNumber, verification.data.pscNotificationId as string);
        const nameMismatch = verification.data.verificationDetails?.nameMismatchReason ?? "" as string;
        const lang = res.locals.lang;
        // Note enums match the API
        const legalNameChange = NameMismatchReasonEnum.LEGALLY_CHANGED;
        const preferredName = NameMismatchReasonEnum.PREFERRED_NAME;
        const translationOrDifferentConvention = NameMismatchReasonEnum.TRANSLATION_OR_DIFF_CONV;
        const publicRegisterError = NameMismatchReasonEnum.REGISTER_ERROR;
        const preferNotToSay = NameMismatchReasonEnum.NOT_SAY;

        return {
            ...baseViewData,
            pscName: pscIndividual.resource?.name!,
            monthYearBorn: formatDateBorn(pscIndividual.resource?.dateOfBirth, res.locals.lang),
            nameMismatch,
            legalNameChange,
            preferredName,
            translationOrDifferentConvention,
            publicRegisterError,
            preferNotToSay,
            backURL: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
            templateName: Urls.NAME_MISMATCH
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { lang });
        }
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<NameMismatchViewData>> {
        logger.info(`called for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: NameMismatchHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, res: Response): Promise<ViewModel<NameMismatchViewData>> {
        logger.info(`called for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"`);
        const viewData = await this.getViewData(req, res);

        try {
            const lang = res.locals.lang;
            const nameMismatchReason = req.body.nameMismatch;

            const queryParams = new URLSearchParams(req.url.split("?")[1]);
            const verification: PscVerificationData = {
                verificationDetails: { nameMismatchReason }
            };

            queryParams.set("lang", lang);
            const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, req.params.transactionId, req.params.submissionId);
            viewData.nextPageUrl = `${nextPageUrl}?${queryParams}`;
            const validator = new PscVerificationFormsValidator(lang);
            viewData.errors = await validator.validateNameMismatch(req.body, lang, viewData.pscName);

            logger.debug(`patching name mismatch reason for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"`);
            await patchPscVerification(req, req.params.transactionId, req.params.submissionId, verification);

        } catch (err: any) {
            logger.debug(`problem handling name mismatch request: ${err.message}`);
            viewData.errors = this.processHandlerException(err);
        }

        return {
            templatePath: NameMismatchHandler.templatePath,
            viewData
        };
    }

}

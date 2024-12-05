import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn } from "../../utils";
import { PscVerification, PscVerificationData } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { patchPscVerification } from "../../../services/pscVerificationService";
import { getPscIndividual } from "../../../services/pscService";
import { PscVerificationFormsValidator } from "../../../lib/validation/form-validators/pscVerification";

interface NameMismatchViewData extends BaseViewData {
    pscName: string,
    monthYearBorn: string,
    nameMismatch: string,
    nextPageUrl: string
}

export class NameMismatchHandler extends GenericHandler<NameMismatchViewData> {

    private static templatePath = "router_views/name_mismatch/name_mismatch";

    public async getViewData (req: Request, res: Response): Promise<NameMismatchViewData> {

        const baseViewData = await super.getViewData(req, res);
        const verification: PscVerification = res.locals.submission;
        const companyNumber = verification.data.companyNumber as string;
        const pscIndividual = await getPscIndividual(req, companyNumber, verification.data.pscAppointmentId as string);
        const nameMismatch = req.query.nameMismatch as string;
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            pscName: pscIndividual.resource?.name!,
            monthYearBorn: formatDateBorn(pscIndividual.resource?.dateOfBirth, selectLang(req.query.lang)),
            nameMismatch,
            currentUrl: resolveUrlTemplate(PrefixedUrls.NAME_MISMATCH),
            backURL: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
            templateName: Urls.NAME_MISMATCH,
            backLinkDataEvent: "name-mismatch-back-link"
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { lang });
        }
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<NameMismatchViewData>> {
        logger.info(`${NameMismatchHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        viewData.nameMismatch = req.query.nameMismatch as string;

        return {
            templatePath: NameMismatchHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, res: Response): Promise<ViewModel<NameMismatchViewData>> {
        logger.info(`${NameMismatchHandler.name} - ${this.executePost.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        try {
            const lang = selectLang(req.query.lang);
            const nameMismatchReason = req.body.nameMismatch;

            const queryParams = new URLSearchParams(req.url.split("?")[1]);
            const verification: PscVerificationData = {
                pscAppointmentId: req.query?.selectedPscId as string,
                verificationDetails: {
                    nameMismatchReason: nameMismatchReason
                }
            };

            queryParams.set("lang", lang);
            const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, req.params.transactionId, req.params.submissionId);
            viewData.nextPageUrl = `${nextPageUrl}?${queryParams}`;
            const validator = new PscVerificationFormsValidator(lang);
            viewData.errors = await validator.validateNameMismatch(req.body, lang, viewData.pscName);

            logger.debug(`${NameMismatchHandler.name} - ${this.executePost.name} - patching name mismatch reason for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
            await patchPscVerification(req, req.params.transactionId, req.params.submissionId, verification);

        } catch (err: any) {
            logger.error(`${req.method} error: problem handling name mismatch request: ${err.message}`);
            viewData.errors = this.processHandlerException(err);
        }

        return {
            templatePath: NameMismatchHandler.templatePath,
            viewData
        };
    }

}

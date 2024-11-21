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

interface PersonalCodeViewData extends BaseViewData {
    pscName: string,
    monthBorn: string,
    personalCode: string,
    nextPageUrl: string
}

export class PersonalCodeHandler extends GenericHandler<PersonalCodeViewData> {

    private static templatePath = "router_views/personal_code/personal_code";

    public async getViewData (req: Request, res: Response): Promise<PersonalCodeViewData> {

        const baseViewData = await super.getViewData(req, res);
        const verification: PscVerification = res.locals.submission;
        const pscIndividual = await getPscIndividual(req, verification.data.companyNumber as string, verification.data.pscAppointmentId as string);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            pscName: pscIndividual.resource?.name!,
            monthBorn: formatDateBorn(pscIndividual.resource?.dateOfBirth, selectLang(req.query.lang)),
            personalCode: verification?.data?.verificationDetails?.uvid || "",
            currentUrl: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
            backURL: resolveUrlTemplate(PrefixedUrls.INDIVIDUAL_PSC_LIST),
            templateName: Urls.PERSONAL_CODE,
            backLinkDataEvent: "personal-code-back-link"
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { lang });
        }
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<PersonalCodeViewData>> {
        logger.info(`${PersonalCodeHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: PersonalCodeHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, res: Response): Promise<ViewModel<PersonalCodeViewData>> {
        logger.info(`${PersonalCodeHandler.name} - ${this.executePost.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        try{
            const lang = selectLang(req.query.lang);
            const uvid = req.body.personalCode;

            const queryParams = new URLSearchParams(req.url.split("?")[1]);
            const verification: PscVerificationData = {
            verificationDetails: {
                uvid: uvid
                }
            };

            queryParams.set("lang", lang);
            const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_STATEMENT, req.params.transactionId, req.params.submissionId);
            viewData.nextPageUrl = `${nextPageUrl}?${queryParams}`;
            const validator = new PscVerificationFormsValidator(lang);
            viewData.errors = await validator.validatePersonalCode(req.body, lang, viewData.pscName);

        logger.debug(`${PersonalCodeHandler.name} - ${this.executePost.name} - patching personal code for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        await patchPscVerification(req, req.params.transactionId, req.params.submissionId, verification);
    
        } catch (err: any) {
            logger.error(`${req.method} error: problem handling PSC details (personal code) request: ${err.message}`);
            viewData.errors = this.processHandlerException(err);
        }

    return {
        templatePath: PersonalCodeHandler.templatePath,
        viewData
    };

        // call API service to patch data here?

    }       

}

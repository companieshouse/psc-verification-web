import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn } from "../../utils";
import { PscVerification, PscVerificationData, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { getValidationStatus, patchPscVerification } from "../../../services/pscVerificationService";
import { getPscIndividual } from "../../../services/pscService";
import { PscVerificationFormsValidator } from "../../../lib/validation/form-validators/pscVerification";
import { Resource } from "@companieshouse/api-sdk-node";

interface PersonalCodeViewData extends BaseViewData {
    pscName: string,
    monthYearBorn: string,
    personalCode: string,
    selectedPscId: string,
    nextPageUrl: string
}

export class PersonalCodeHandler extends GenericHandler<PersonalCodeViewData> {

    private static templatePath = "router_views/personalCode/personal-code";

    public async getViewData (req: Request, res: Response): Promise<PersonalCodeViewData> {

        const baseViewData = await super.getViewData(req, res);
        const verification: PscVerification = res.locals.submission;
        const companyNumber = verification.data.companyNumber as string;
        const pscIndividual = await getPscIndividual(req, companyNumber, verification.data.pscAppointmentId as string);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            pscName: pscIndividual.resource?.name!,
            monthYearBorn: formatDateBorn(pscIndividual.resource?.dateOfBirth, selectLang(req.query.lang)),
            personalCode: verification?.data?.verificationDetails?.uvid || "",
            currentUrl: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
            backURL: addSearchParams(PrefixedUrls.INDIVIDUAL_PSC_LIST, { companyNumber, lang }),
            templateName: Urls.PERSONAL_CODE
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

        try {
            const lang = selectLang(req.query.lang);
            const uvid = req.body.personalCode;

            const queryParams = new URLSearchParams(req.url.split("?")[1]);
            const verification: PscVerificationData = {
                pscAppointmentId: req.query?.selectedPscId as string,
                verificationDetails: {
                    uvid: uvid
                }
            };

            queryParams.set("lang", lang);

            const validator = new PscVerificationFormsValidator(lang);
            viewData.errors = await validator.validatePersonalCode(req.body, lang, viewData.pscName);

            logger.debug(`${PersonalCodeHandler.name} - ${this.executePost.name} - patching personal code for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
            await patchPscVerification(req, req.params.transactionId, req.params.submissionId, verification);

            const validationStatusResponse = await getValidationStatus(req, req.params.transactionId, req.params.submissionId);
            const url = this.resolveNextPageUrl(validationStatusResponse);
            const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(url, req.params.transactionId, req.params.submissionId);
            viewData.nextPageUrl = `${nextPageUrl}?${queryParams}`;

        } catch (err: any) {
            logger.error(`${req.method} error: problem handling PSC details (personal code) request: ${err.message}`);
            viewData.errors = this.processHandlerException(err);
        }

        return {
            templatePath: PersonalCodeHandler.templatePath,
            viewData
        };
    }

    private resolveNextPageUrl (validationStatusResponse: Resource<ValidationStatusResponse>): string {
        let url = PrefixedUrls.INDIVIDUAL_STATEMENT;

        if (validationStatusResponse.resource && validationStatusResponse.resource.isValid === false) {
            const hasNameMismatchError = validationStatusResponse.resource.errors?.some((validationError: { error: string | string[]; }) => validationError.error.includes("name mismatch"));
            url = hasNameMismatchError ? PrefixedUrls.NAME_MISMATCH : PrefixedUrls.INDIVIDUAL_STATEMENT;
        }

        return url;
    }

}

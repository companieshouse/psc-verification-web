import { Request, Response } from "express";
import { PrefixedUrls, STOP_TYPE, Urls, toStopScreenPrefixedUrl } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn } from "../../utils";
import { PscVerification, PscVerificationData, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { getValidationStatus, patchPscVerification } from "../../../services/pscVerificationService";
import { getPscIndividual } from "../../../services/pscService";
import { PscVerificationFormsValidator } from "../../../lib/validation/form-validators/pscVerification";
import { Resource } from "@companieshouse/api-sdk-node";
import { getDobValidationMessage, getNameValidationMessages } from "../../../middleware/checkValidationMessages";

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

    private resolveNextPageUrl (validationStatusResponse: Resource<ValidationStatusResponse>) : string {
        const url: string = PrefixedUrls.INDIVIDUAL_STATEMENT;

        if (validationStatusResponse.resource && validationStatusResponse.resource.isValid === false) {
            const hasError = (messages: string[], errors: { error: string | string[] }[]): boolean => {
                return errors.some((validationError) => {
                    return messages.some((message) => validationError.error.includes(message));
                });
            };

            const dobMismatchMessage: string[] = getDobValidationMessage();
            const nameMismatchMessages: string[] = getNameValidationMessages();

            // The DOB mismatch takes priory over a name mismatch
            if (hasError(dobMismatchMessage, validationStatusResponse.resource.errors)) {
                return getUrlWithStopType(toStopScreenPrefixedUrl(STOP_TYPE.PSC_DOB_MISMATCH), STOP_TYPE.PSC_DOB_MISMATCH);
            }

            if (hasError(nameMismatchMessages, validationStatusResponse.resource.errors)) {
                return PrefixedUrls.NAME_MISMATCH;
            }
        }

        return url;
    }

}

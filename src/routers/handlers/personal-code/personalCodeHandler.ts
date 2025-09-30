import { Request, Response } from "express";

import { PrefixedUrls, STOP_TYPE, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn } from "../../utils";
import { PscVerification, PscVerificationData, ValidationStatusResponse } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { getValidationStatus, patchPscVerification } from "../../../services/pscVerificationService";
import { getPscIndividual } from "../../../services/pscService";
import { PscVerificationFormsValidator } from "../../../lib/validation/form-validators/pscVerification";
import { Resource } from "@companieshouse/api-sdk-node";
import { getDobValidationMessage, getNameValidationMessage, getUvidValidationMessages } from "../../../utils/validationMessages";

interface PersonalCodeViewData extends BaseViewData {
    pscName: string,
    monthYearBorn: string,
    personalCode: string,
    selectedPscId: string,
    nextPageUrl: string
}

export class PersonalCodeHandler extends GenericHandler<PersonalCodeViewData> {

    private static readonly templatePath = "router_views/personalCode/personal-code";

    public async getViewData (req: Request, res: Response): Promise<PersonalCodeViewData> {

        const baseViewData = await super.getViewData(req, res);
        const verification: PscVerification = res.locals.submission;
        const companyNumber = verification.data.companyNumber as string;
        const pscIndividual = await getPscIndividual(req, companyNumber, verification.data.pscNotificationId as string);
        const lang = res.locals.lang;

        return {
            ...baseViewData,
            pscName: pscIndividual.resource?.name!,
            monthYearBorn: formatDateBorn(pscIndividual.resource?.dateOfBirth, lang),
            personalCode: verification?.data?.verificationDetails?.uvid ?? "",
            currentUrl: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
            backURL: addSearchParams(PrefixedUrls.INDIVIDUAL_PSC_LIST, { companyNumber, lang }),
            templateName: Urls.PERSONAL_CODE
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { lang });
        }
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<PersonalCodeViewData>> {
        logger.info(`called for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: PersonalCodeHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, res: Response): Promise<ViewModel<PersonalCodeViewData>> {
        logger.info(`called for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"`);
        const viewData = await this.getViewData(req, res);

        try {
            const lang = res.locals.lang;
            const uvid = req.body.personalCode;

            const queryParams = new URLSearchParams(req.url.split("?")[1]);
            const verification: PscVerificationData = {
                pscNotificationId: req.query?.selectedPscId as string,
                verificationDetails: { uvid }
            };

            queryParams.set("lang", lang);

            const validator = new PscVerificationFormsValidator(lang);
            viewData.errors = await validator.validatePersonalCode(req.body, lang, viewData.pscName);

            logger.debug(`patching personal code for transactionId="${req.params?.transactionId}", submissionId="${req.params?.submissionId}"`);
            const patchResponse = await patchPscVerification(req, req.params.transactionId, req.params.submissionId, verification);
            const validationStatusResponse = await getValidationStatus(req, req.params.transactionId, req.params.submissionId, ["$.verification_statement"]);
            const url = this.resolveNextPageUrl(validationStatusResponse, patchResponse);
            const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(url, req.params.transactionId, req.params.submissionId);
            viewData.nextPageUrl = `${nextPageUrl}?${queryParams}`;

        } catch (err: any) {
            logger.debug(`problem handling personal code request: ${err.message}`);
            viewData.errors = this.processHandlerException(err);
        }

        return {
            templatePath: PersonalCodeHandler.templatePath,
            viewData
        };
    }

    private resolveNextPageUrl (validationStatusResponse: Resource<ValidationStatusResponse>, patchResponse: Resource<PscVerification>): string {

        if (validationStatusResponse.resource?.isValid === false) {
            const validationErrors = validationStatusResponse.resource.errors;

            if (this.hasErrorMessage(getDobValidationMessage(), validationErrors) ||
                this.hasErrorMessage(getUvidValidationMessages(), validationErrors)) {
                return getUrlWithStopType(PrefixedUrls.STOP_SCREEN_SUBMISSION, STOP_TYPE.PSC_DOB_MISMATCH);
            }

            // stop page takes precedence over a name mismatch
            if (this.hasErrorMessage(getNameValidationMessage(), validationErrors)) {
                return PrefixedUrls.NAME_MISMATCH;
            }
        }

        // valid submission with potential name mismatch reason
        return (patchResponse.resource?.data?.verificationDetails?.nameMismatchReason != null) ? PrefixedUrls.NAME_MISMATCH : PrefixedUrls.INDIVIDUAL_STATEMENT;
    }

    private hasErrorMessage (messages: string[] | string, validationErrors: { error: string }[]): boolean {
        const messageArray = Array.isArray(messages) ? messages : [messages];

        return validationErrors.some((validationError) => {
            const validationMessages = Array.isArray(validationError.error) ? validationError.error : [validationError.error];
            return messageArray.some((message) => validationMessages.includes(message));
        });
    }

}

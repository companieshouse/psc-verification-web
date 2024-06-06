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
import { PscVerification, VerificationStatement } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";

interface IndividualStatementViewData extends BaseViewData {pscName: string, selectedStatements: string[], dateOfBirth: string}

export class IndividualStatementHandler extends GenericHandler<IndividualStatementViewData> {

    private static templatePath = "router_views/individual_statement/individual_statement";

    public async getViewData (req: Request, res: Response): Promise<IndividualStatementViewData> {

        const baseViewData = await super.getViewData(req, res);
        const verificationResource = res.locals.submission;
        const pscDetailsResponse = await getPscIndividual(req, verificationResource?.data.company_number as string,
                                                verificationResource?.data.psc_appointment_id as string);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const selectedStatements = verificationResource?.data?.verification_details?.verification_statements || [];

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            pscName: pscDetailsResponse.resource?.name!,
            selectedStatements,
            dateOfBirth: formatDateBorn(pscDetailsResponse.resource?.dateOfBirth, selectLang(req.query.lang)),
            currentUrl: resolveUrlTemplate(PrefixedUrls.INDIVIDUAL_STATEMENT),
            backURL: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
            templateName: Urls.INDIVIDUAL_STATEMENT,
            backLinkDataEvent: "psc-statement-back-link"
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { lang });
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

    public async executePost (req: Request, res: Response) {
        logger.info(`${IndividualStatementHandler.name} - ${this.executePost.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const statement: VerificationStatement = req.body.psc_individual_statement; // a single string rather than string[] is returned (because there is only 1 checkbox in the group?)
        const selectedStatements = [statement];
        const verification: PscVerification = {
            verification_details: {
                verification_statements: selectedStatements
            }
        };
        logger.debug(`${IndividualStatementHandler.name} - ${this.executePost.name} - patching individual verification statement for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        await patchPscVerification(req, req.params.transactionId, req.params.submissionId, verification);
    }
}

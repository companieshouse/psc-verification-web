import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getPscIndividual } from "../../../services/pscService";
import { getPscVerification } from "../../../services/pscVerificationService";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn } from "../../utils";

interface IndividualStatementViewData extends BaseViewData {pscName: string, selectedStatements: string[], dateOfBirth: string}

export class IndividualStatementHandler extends GenericHandler<IndividualStatementViewData> {

    private static templatePath = "router_views/individual_statement/individual_statement";

    public async getViewData (req: Request): Promise<IndividualStatementViewData> {

        const baseViewData = await super.getViewData(req);
        const verificationResponse = await getPscVerification(req, req.params.transactionId, req.params.submissionId);
        const pscDetailsResponse = await getPscIndividual(req, verificationResponse.resource?.data.company_number as string,
                                                verificationResponse.resource?.data.psc_appointment_id as string);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const selectedStatements = verificationResponse.resource?.data?.verification_details?.verification_statements || [];

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            pscName: pscDetailsResponse.resource?.name!,
            selectedStatements,
            dateOfBirth: formatDateBorn(pscDetailsResponse.resource?.dateOfBirth, selectLang(req.query.lang)),
            currentUrl: addSearchParams(PrefixedUrls.INDIVIDUAL_STATEMENT, { lang }),
            backURL: addSearchParams(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, req.params.transactionId, req.params.submissionId), { lang })
        };
    }

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<IndividualStatementViewData>> {
        logger.info(`IndividualStatementHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: IndividualStatementHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, _response: Response) {
        const statement: string = req.body.psc_individual_statement; // a single string rather than string[] is returned (because there is only 1 checkbox in the group?)
        const selectedStatements = [statement];
        // TODO: here we would patch the Resource with the statements
        // patchPscVerification(selectedStatements)
    }
}

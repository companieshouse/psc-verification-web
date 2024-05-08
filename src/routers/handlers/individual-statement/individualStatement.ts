import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";

interface IndividualStatementViewData extends BaseViewData {PscName: string, DateOfBirth: string}

export class IndividualStatementHandler extends GenericHandler<IndividualStatementViewData> {

    private static templatePath = "router_views/individual_statement/individual_statement";

    public async getViewData (req: Request): Promise<IndividualStatementViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: addSearchParams(PrefixedUrls.INDIVIDUAL_STATEMENT, { lang }),
            backURL: addSearchParams(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, req.params.transactionId, req.params.submissionId), { lang })
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<IndividualStatementViewData>> {
        logger.info(`IndividualStatementHandler execute called`);
        const viewData = await this.getViewData(req);

        viewData.PscName = _response.locals.pscDetails.name;
        viewData.DateOfBirth = formatDateBorn(_response.locals.pscDetails.dateOfBirth);

        return {
            templatePath: IndividualStatementHandler.templatePath,
            viewData
        };
    }
}

function formatDateBorn (dateOfBirth: any): string {
    return `${Intl.DateTimeFormat("en", { month: "long" }).format(new Date("" + dateOfBirth.month))} ${dateOfBirth.year}`;
}

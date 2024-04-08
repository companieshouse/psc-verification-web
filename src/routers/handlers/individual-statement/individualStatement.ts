import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";

interface IndividualStatementViewData extends BaseViewData { }

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
            backURL: addSearchParams(PrefixedUrls.PERSONAL_CODE, { lang })
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<IndividualStatementViewData>> {
        logger.info(`IndividualStatementHandler execute called`);
        const viewData = await this.getViewData(req);
        return {
            templatePath: IndividualStatementHandler.templatePath,
            viewData
        };
    }
}

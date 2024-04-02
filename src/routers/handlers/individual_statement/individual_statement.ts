import { Request, Response } from "express";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { logger } from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

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
            currentUrl: PrefixedUrls.INDIVIDUAL_STATEMENT,
            backURL: PrefixedUrls.PERSONAL_CODE
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

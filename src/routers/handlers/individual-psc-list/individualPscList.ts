import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

export class IndividualPscListHandler extends GenericHandler<BaseViewData> {

    private static templatePath = "router_views/individualPscList/individualPscList";

    public async getViewData (req: Request): Promise<BaseViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: PrefixedUrls.INDIVIDUAL_PSC_LIST,
            backURL: PrefixedUrls.PSC_TYPE
        };
    }

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<BaseViewData>> {
        logger.info(`IndividualPscListHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }
}

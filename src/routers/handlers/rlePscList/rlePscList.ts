import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/Logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

interface RleListViewData extends BaseViewData {

}

export class RleListHandler extends GenericHandler<RleListViewData> {

    private static templatePath = "router_views/rlePscList/rlePscList";

    public async getViewData (req: Request): Promise<RleListViewData> {

        const baseViewData = await super.getViewData(req);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Rle List",
            currentUrl: addSearchParams(PrefixedUrls.RLE_LIST, { lang }),
            backURL: addSearchParams(PrefixedUrls.PSC_TYPE, { lang })
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<RleListViewData>> {
        logger.info(`RleListHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: RleListHandler.templatePath,
            viewData
        };
    }
}

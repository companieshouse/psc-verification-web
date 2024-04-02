import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";
import { logger } from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

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
            currentUrl: PrefixedUrls.RLE_LIST + "?lang=" + lang,
            backURL: PrefixedUrls.PSC_TYPE + "?lang=" + lang
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

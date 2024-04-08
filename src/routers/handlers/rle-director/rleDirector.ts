import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

interface RleListViewData extends BaseViewData {

}

export class RleDirectorHandler extends GenericHandler<RleListViewData> {

    private static templatePath = "router_views/rleDirector/rleDirector";

    public async getViewData (req: Request): Promise<RleListViewData> {

        const baseViewData = await super.getViewData(req);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Are They A Director?",
            currentUrl: PrefixedUrls.RLE_DIRECTOR + "?lang=" + lang,
            backURL: PrefixedUrls.RLE_DETAILS + "?lang=" + lang
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<RleListViewData>> {
        logger.info(`RleDirectorHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: RleDirectorHandler.templatePath,
            viewData
        };
    }
}

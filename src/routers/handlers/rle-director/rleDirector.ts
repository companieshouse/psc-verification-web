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

    private static templatePath = "router_views/rle-director/rleDirector";

    public async getViewData (req: Request, res: Response): Promise<RleListViewData> {

        const baseViewData = await super.getViewData(req, res);

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

    public async executeGet (req: Request, res: Response): Promise<ViewModel<RleListViewData>> {
        logger.info(`${RleDirectorHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId}`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: RleDirectorHandler.templatePath,
            viewData
        };
    }
}

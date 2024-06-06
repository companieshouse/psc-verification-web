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

export class RleDetailsHandler extends GenericHandler<RleListViewData> {

    private static templatePath = "router_views/rleDetails/rleDetails";

    public async getViewData (req: Request, res: Response): Promise<RleListViewData> {

        const baseViewData = await super.getViewData(req, res);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Rle Details",
            currentUrl: PrefixedUrls.RLE_DETAILS + "?lang=" + lang,
            backURL: PrefixedUrls.RLE_LIST + "?lang=" + lang
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<RleListViewData>> {
        logger.info(`${RleDetailsHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId}`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: RleDetailsHandler.templatePath,
            viewData
        };
    }
}

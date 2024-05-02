import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

interface RleVerifiedViewData extends BaseViewData {

}

export class RleVerifiedHandler extends GenericHandler<RleVerifiedViewData> {

    private static templatePath = "router_views/rle_verified/rleVerified";

    public async getViewData (req: Request): Promise<RleVerifiedViewData> {

        const baseViewData = await super.getViewData(req);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "PSC confirmed",
            currentUrl: PrefixedUrls.RLE_VERIFIED + "?lang=" + lang,
            backURL: PrefixedUrls.CONFIRM_RO_STATEMENTS + "?lang=" + lang
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<RleVerifiedViewData>> {
        logger.info(`RleVerifiedHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: RleVerifiedHandler.templatePath,
            viewData
        };
    }
}

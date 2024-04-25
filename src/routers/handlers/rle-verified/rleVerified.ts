import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

interface RLeVerifiedViewData extends BaseViewData {

}

export class RleVerifiedHandler extends GenericHandler<RLeVerifiedViewData> {

    private static templatePath = "router_views/rle_verified/rleVerified";

    public async getViewData (req: Request): Promise<RLeVerifiedViewData> {

        const baseViewData = await super.getViewData(req);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Rle Verified",
            currentUrl: PrefixedUrls.RLE_VERIFIED + "?lang=" + lang,
            backURL: PrefixedUrls.CONFIRM_RO_STATEMENTS + "?lang=" + lang
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<RLeVerifiedViewData>> {
        logger.info(`RleVerifiedHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: RleVerifiedHandler.templatePath,
            viewData
        };
    }
}

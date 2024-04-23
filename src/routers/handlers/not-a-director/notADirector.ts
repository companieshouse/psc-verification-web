import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

interface NotADirectorViewData extends BaseViewData {

}

export class NotADirectorHandler extends GenericHandler<NotADirectorViewData> {

    private static templatePath = "router_views/not_a_director/not_a_director";

    public async getViewData (req: Request): Promise<NotADirectorViewData> {

        const baseViewData = await super.getViewData(req);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Psc Verified",
            currentUrl: PrefixedUrls.RLE_DIRECTOR + "?lang=" + lang,
            backURL: PrefixedUrls.NOT_A_DIRECTOR + "?lang=" + lang
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<NotADirectorViewData>> {
        logger.info(`NotADirectorHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: NotADirectorHandler.templatePath,
            viewData
        };
    }
}

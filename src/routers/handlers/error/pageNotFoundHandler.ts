import { Request, Response } from "express";
import { Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { env } from "../../../config";

interface PageNotFoundViewData extends BaseViewData {
  extraData?: string[];
}

export default class PageNotFoundHandler extends GenericHandler<PageNotFoundViewData> {

    public static templatePath = "router_views/error/page-not-found";

    public async getViewData (req: Request, res: Response): Promise<PageNotFoundViewData> {
        const baseViewData = await super.getViewData(req, res);
        // adding language functionality
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            isSignedIn: false,
            currentUrl: req.url,
            backURL: null,
            templateName: Urls.PAGE_NOT_FOUND,
            extraData: [env.CONTACT_US_LINK]
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<PageNotFoundViewData>> {
        logger.info(`${PageNotFoundHandler.name} - ${this.executeGet.name}: called to serve 404 error page`);

        // ...process request here and return data for the view
        return {
            templatePath: PageNotFoundHandler.templatePath,
            viewData: await this.getViewData(req, res)
        };
    }
}

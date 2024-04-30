import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "./../generic";
import { addSearchParams } from "../../../utils/queryParams";

export class StartHandler extends GenericHandler<BaseViewData> {

    public static templatePath = "router_views/start/start";

    public async getViewData (req: Request): Promise<BaseViewData> {
        const baseViewData = await super.getViewData(req);
        // adding language functionality
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            isSignedIn: false,
            title: "PSC Verification",
            currentUrl: addSearchParams(PrefixedUrls.START, { lang }),
            backURL: null,
            templateName: Urls.START
        };
    }

    public async execute (req: Request, _response: Response): Promise<ViewModel<BaseViewData>> {
        logger.info(`GET request to serve start page`);
        // ...process request here and return data for the view

        return {
            templatePath: StartHandler.templatePath,
            viewData: await this.getViewData(req)
        };
    }
};

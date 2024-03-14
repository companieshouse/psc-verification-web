import { Request, Response } from "express";
import { BaseViewData, GenericHandler, ViewModel } from "./../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

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
            title: "PSC Verification",
            currentUrl: PrefixedUrls.START,
            backURL: null
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

import { Request, Response } from "express";
import { Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { env } from "../../../config";

interface InternalServerErrorViewData extends BaseViewData {
  extraData?: string[];
}

export default class InternalServerErrorHandler extends GenericHandler<InternalServerErrorViewData> {

    public static templatePath = "router_views/error/internal-server-error";

    public async getViewData (req: Request, res: Response): Promise<InternalServerErrorViewData> {
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
            templateName: Urls.INTERNAL_SERVER_ERROR,
            extraData: [env.CONTACT_US_LINK]
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<InternalServerErrorViewData>> {
        logger.info(`${InternalServerErrorHandler.name} - ${this.executeGet.name}: called to serve 500 error page`);

        // ...process request here and return data for the view
        return {
            templatePath: InternalServerErrorHandler.templatePath,
            viewData: await this.getViewData(req, res)
        };
    }
}

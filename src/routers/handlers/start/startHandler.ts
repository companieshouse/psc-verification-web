import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { addSearchParams } from "../../../utils/queryParams";
import { internationaliseDate } from "../../utils";
import { env } from "../../../config";

interface StartViewData extends BaseViewData {idvImplementationDate: string}

export default class StartHandler extends GenericHandler<StartViewData> {

    public static templatePath = "router_views/start/start";

    public async getViewData (req: Request, res: Response): Promise<StartViewData> {
        const baseViewData = await super.getViewData(req, res);
        // adding language functionality
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const idvDate = env.IDV_IMPLEMENTATION_DATE; // "yyyymmdd"
        const idvDateFormatted = [idvDate.slice(0, 4), idvDate.slice(4, 6), idvDate.slice(6, 8)].join("-"); // yyyy-mm-dd

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            isSignedIn: false,
            idvImplementationDate: internationaliseDate(idvDateFormatted, lang),
            currentUrl: addSearchParams(PrefixedUrls.START, { lang }),
            backURL: null,
            templateName: Urls.START
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<StartViewData>> {
        logger.info(`called to serve start page`);

        // ...process request here and return data for the view
        return {
            templatePath: StartHandler.templatePath,
            viewData: await this.getViewData(req, res)
        };
    }
}

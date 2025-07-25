import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { env } from "../../../config";
import { toHourDayDateFormat } from "../../../utils/date";
import { addSearchParams } from "../../../utils/queryParams";

interface ServiceUnavailableViewData extends BaseViewData {
  extraData?: string[];
}

export default class ServiceUnavailableHandler extends GenericHandler<ServiceUnavailableViewData> {

    public static readonly templatePath = "router_views/serviceUnavailable/service-unavailable";

    public async getViewData (req: Request, res: Response): Promise<ServiceUnavailableViewData> {
        const baseViewData = await super.getViewData(req, res);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const maintenanceEndTime = toHourDayDateFormat(res.locals.maintenanceEndTime, lang);

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            isSignedIn: false,
            currentUrl: addSearchParams(PrefixedUrls.SERVICE_UNAVAILABLE, { lang }),
            templateName: Urls.SERVICE_UNAVAILABLE,
            extraData: [maintenanceEndTime, env.CONTACT_US_LINK]
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<ServiceUnavailableViewData>> {
        logger.info(`called to serve Service Unavailable page`);

        return {
            templatePath: ServiceUnavailableHandler.templatePath,
            viewData: await this.getViewData(req, res)
        };
    }
}

import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/Logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";

interface PscTypeViewData extends BaseViewData {}

export class PscTypeHandler extends GenericHandler<PscTypeViewData> {

    private static templatePath = "router_views/psc_type/psc_type";

    public async getViewData (req: Request): Promise<PscTypeViewData> {
        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
            currentUrl: PrefixedUrls.PSC_TYPE + "?lang=" + lang,
            backURL: PrefixedUrls.CONFIRM_COMPANY + "?lang=" + lang
        };
    }

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<PscTypeViewData>> {
        logger.info(`PscTypeHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: PscTypeHandler.templatePath,
            viewData
        };
    }
}

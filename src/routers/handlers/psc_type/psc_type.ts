import { Request, Response } from "express";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

interface PscTypeViewData extends BaseViewData {}

export class PscTypeHandler extends GenericHandler<PscTypeViewData> {

    private static templatePath = "router_views/psc_type/psc_type";

    public getViewData (req: Request): PscTypeViewData {
        const baseViewData = super.getViewData(req);
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

    public executeGet (req: Request, _response: Response): ViewModel<PscTypeViewData> {
        logger.info(`PscTypeHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: PscTypeHandler.templatePath,
            viewData
        };
    }
}

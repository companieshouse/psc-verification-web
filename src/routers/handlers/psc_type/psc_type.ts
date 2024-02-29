import { Request, Response } from "express";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

export class PscTypeHandler extends GenericHandler<BaseViewData> {

    private static templatePath = "router_views/psc_type/psc_type";

    public getViewData (req: Request): BaseViewData {
        const baseViewData = super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
            currentUrl: PrefixedUrls.PSC_TYPE,
            backURL: PrefixedUrls.SKELETON_ONE
        };
    }

    public execute (req: Request, _response: Response): ViewModel<BaseViewData> {
        logger.info(`PscTypeHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: PscTypeHandler.templatePath,
            viewData: this.getViewData(req)
        };
    }
}

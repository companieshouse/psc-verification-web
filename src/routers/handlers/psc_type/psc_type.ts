import { Request, Response } from "express";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

export class PscTypeHandler extends GenericHandler<BaseViewData> {

    private static templatePath = "router_views/psc_type/psc_type";

    public async getViewData (req: Request): Promise<BaseViewData> {
        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
            currentUrl: PrefixedUrls.PSC_TYPE,
            backURL: PrefixedUrls.CONFIRM_COMPANY
        };
    }

    public async execute (req: Request, _response: Response): Promise<ViewModel<BaseViewData>> {
        logger.info(`PscTypeHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: PscTypeHandler.templatePath,
            viewData
        };
    }
}

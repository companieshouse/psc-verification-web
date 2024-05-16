import { Request, Response } from "express";
import { PrefixedUrls, SessionKeys, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
interface PscTypeViewData extends BaseViewData { pscType: string }

export class PscTypeHandler extends GenericHandler<PscTypeViewData> {

    private static templatePath = "router_views/psc_type/psc_type";

    public async getViewData (req: Request): Promise<PscTypeViewData> {
        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const companyNumber = req.session?.getExtraData(SessionKeys.COMPANY_NUMBER) as string;

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
            currentUrl: addSearchParams(PrefixedUrls.PSC_TYPE, { lang }),
            backURL: addSearchParams(PrefixedUrls.CONFIRM_COMPANY, { companyNumber, lang }),
            templateName: Urls.PSC_TYPE,
            backLinkDataEvent: "psc-type-back-link"
        };
    }

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<PscTypeViewData>> {
        logger.info(`PscTypeHandler execute called`);
        const viewData = await this.getViewData(req);

        viewData.pscType = req.query.pscType as string;

        return {
            templatePath: PscTypeHandler.templatePath,
            viewData
        };
    }
}

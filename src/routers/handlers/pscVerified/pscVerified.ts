import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/Logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

interface PscVerifiedViewData extends BaseViewData {

}

export class PscVerifiedHandler extends GenericHandler<PscVerifiedViewData> {

    private static templatePath = "router_views/pscVerified/pscVerified";

    public async getViewData (req: Request): Promise<PscVerifiedViewData> {

        const baseViewData = await super.getViewData(req);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Psc Verified",
            currentUrl: addSearchParams(PrefixedUrls.PSC_VERIFIED, { lang }),
            backURL: addSearchParams(PrefixedUrls.INDIVIDUAL_STATEMENT, { lang })
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<PscVerifiedViewData>> {
        logger.info(`PscVerifiedHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: PscVerifiedHandler.templatePath,
            viewData
        };
    }
}

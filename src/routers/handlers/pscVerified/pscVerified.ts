import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

interface PscVerifiedViewData extends BaseViewData {

}

export class PscVerifiedHandler extends GenericHandler<PscVerifiedViewData> {

    private static templatePath = "router_views/pscVerified/pscVerified";

    public getViewData (req: Request): PscVerifiedViewData {

        const baseViewData = super.getViewData(req);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Psc Verified",
            currentUrl: PrefixedUrls.PSC_VERIFIED + "?lang=" + lang,
            backURL: PrefixedUrls.INDIVIDUAL_STATEMENT + "?lang=" + lang
        };
    }

    public executeGet (
        req: Request,
        _response: Response
    ): ViewModel<PscVerifiedViewData> {
        logger.info(`PscVerifiedHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: PscVerifiedHandler.templatePath,
            viewData
        };
    }
}

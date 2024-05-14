import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

interface PscVerifiedViewData extends BaseViewData {
    referenceNumber: String;
    companyName: String;
    companyNumber: String;
    pscName: String;
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
            currentUrl: PrefixedUrls.PSC_VERIFIED + "?lang=" + lang,
            templateName: Urls.PSC_VERIFIED,
            referenceNumber: req.params.transactionId,
            companyName: "Test Data LTD",
            companyNumber: "99999999",
            pscName: "Mr Test Testerton"
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

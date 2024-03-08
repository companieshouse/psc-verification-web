import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

export class IndividualPscListHandler extends GenericHandler<BaseViewData> {

    private static templatePath = "router_views/individualPscList/individualPscList";

    public getViewData (req: Request): BaseViewData {

        const baseViewData = super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: PrefixedUrls.INDIVIDUAL_PSC_LIST,
            backURL: PrefixedUrls.PSC_TYPE
        };
    }

    public executeGet (req: Request, _response: Response): ViewModel<BaseViewData> {
        logger.info(`IndividualPscListHandler execute called`);
        const viewData = this.getViewData(req);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }
}

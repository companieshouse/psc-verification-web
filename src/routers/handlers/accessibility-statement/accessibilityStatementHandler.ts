import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { addSearchParams } from "../../../utils/queryParams";

export default class AccessibilityStatementHandler extends GenericHandler<BaseViewData> {

    public static readonly templatePath = "router_views/accessibilityStatement/accessibility-statement";

    public async getViewData (req: Request, res: Response): Promise<BaseViewData> {
        const baseViewData = await super.getViewData(req, res);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        res.locals.englishOnly = true; // To be removed when translations are added

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, "en"), // To be removed when translations are added
            isSignedIn: false,
            currentUrl: addSearchParams(PrefixedUrls.ACCESSIBILITY_STATEMENT, { lang }),
            backURL: null,
            templateName: Urls.ACCESSIBILITY_STATEMENT
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<BaseViewData>> {
        logger.info(`called to serve accessibility statement page`);

        // ...process request here and return data for the view
        return {
            templatePath: AccessibilityStatementHandler.templatePath,
            viewData: await this.getViewData(req, res)
        };
    }
}

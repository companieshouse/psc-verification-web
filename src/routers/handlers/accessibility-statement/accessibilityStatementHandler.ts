import { Request, Response } from "express";
import { Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";

export default class AccessibilityStatementHandler extends GenericHandler<BaseViewData> {

    public static readonly templatePath = "router_views/accessibilityStatement/accessibility-statement";

    public async getViewData (req: Request, res: Response): Promise<BaseViewData> {
        const baseViewData = await super.getViewData(req, res);
        const lang = "en";
        res.locals.englishOnly = true; // To be removed when translations are added

        return {
            ...baseViewData,
            hideNavbar: true,
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

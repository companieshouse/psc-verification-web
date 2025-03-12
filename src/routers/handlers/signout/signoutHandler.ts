import { Request, Response } from "express";
import { ExternalUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";

interface SignoutViewData extends BaseViewData {
    signoutRedirectPath: string
}

export default class SignoutHandler extends GenericHandler<SignoutViewData> {

    public static templatePath = "n/a";

    public async getViewData (req: Request, res: Response): Promise<SignoutViewData> {
        const baseViewData = await super.getViewData(req, res);
        // adding language functionality
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            isSignedIn: false,
            signoutRedirectPath: ExternalUrls.SIGNOUT,
            currentUrl: req.get("Referrer")!,
            backURL: null,
            templateName: ExternalUrls.SIGNOUT
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<SignoutViewData>> {
        logger.info(`${SignoutHandler.name} - ${this.executeGet.name}: called to perform signout`);

        // ...process request here and return data for the view
        return {
            templatePath: SignoutHandler.templatePath,
            viewData: await this.getViewData(req, res)
        };
    }
}

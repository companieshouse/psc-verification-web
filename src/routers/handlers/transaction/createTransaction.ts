import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";

interface CreateTransactionViewData extends BaseViewData {
}

export class CreateTransactionHandler extends GenericHandler<CreateTransactionViewData> {

    private static templatePath = "";

    public getViewData (req: Request): CreateTransactionViewData {

        const baseViewData = super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: PrefixedUrls.CREATE_TRANSACTION + "?lang=" + lang,
            backURL: PrefixedUrls.START + "?lang=" + lang
        };
    }

    public executeGet (req: Request, _response: Response): ViewModel<CreateTransactionViewData> {
        logger.info(`CreateTransactionHandler execute called`);

        const companyNumber = req.query.companyNumber as string;

        const viewData = this.getViewData(req);

        return {
            templatePath: CreateTransactionHandler.templatePath,
            viewData
        };
    }
}

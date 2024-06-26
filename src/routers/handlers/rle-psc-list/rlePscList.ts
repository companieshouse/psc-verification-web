import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";

interface RleListViewData extends BaseViewData {

}

export class RleListHandler extends GenericHandler<RleListViewData> {

    private static templatePath = "router_views/rlePscList/rlePscList";

    public async getViewData (req: Request, res: Response): Promise<RleListViewData> {

        const baseViewData = await super.getViewData(req, res);

        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const queryParams = new URLSearchParams(req.url.split("?")[1]);

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Rle List",
            currentUrl: `${PrefixedUrls.RLE_LIST}?${queryParams}`,
            backURL: `${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, req.params.transactionId, req.params.submissionId)}?${queryParams}`
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<RleListViewData>> {
        logger.info(`${RleListHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: RleListHandler.templatePath,
            viewData
        };
    }
}

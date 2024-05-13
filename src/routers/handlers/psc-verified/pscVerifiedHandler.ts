import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";
import { closeTransaction } from "../../../services/transactionService";

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
            currentUrl: addSearchParams(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, req.params.transactionId, req.params.submissionId), { lang })
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<PscVerifiedViewData>> {
        logger.info(`PscVerifiedHandler execute called`);
        const viewData = await this.getViewData(req);

        const closure = await closeTransaction(req, req.params.transactionId, req.params.submissionId)
            .catch((err) => {
            // TODO: handle failure properly (redirect to Error Screen? TBC)
                console.log(err);
            });

        return {
            templatePath: PscVerifiedHandler.templatePath,
            viewData
        };
    }
}

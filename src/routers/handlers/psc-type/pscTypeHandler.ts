import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { addSearchParams } from "../../../utils/queryParams";
interface PscTypeViewData extends BaseViewData { pscType: string }

export class PscTypeHandler extends GenericHandler<PscTypeViewData> {

    private static templatePath = "router_views/psc_type/psc_type";

    public async getViewData (req: Request, res: Response): Promise<PscTypeViewData> {
        const baseViewData = await super.getViewData(req, res);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const companyNumber = req.query.companyNumber as string;
        const pscType = req.query.pscType as string;

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
            currentUrl: resolveUrlTemplate(PrefixedUrls.PSC_TYPE),
            backURL: resolveUrlTemplate(PrefixedUrls.CONFIRM_COMPANY),
            templateName: Urls.PSC_TYPE,
            backLinkDataEvent: "psc-type-back-link"
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { companyNumber, lang, pscType });
        }
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<PscTypeViewData>> {

        logger.info(`${PscTypeHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        viewData.pscType = req.query.pscType as string;

        return {
            templatePath: PscTypeHandler.templatePath,
            viewData
        };
    }
}

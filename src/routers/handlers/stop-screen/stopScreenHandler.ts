import { Request, Response } from "express";
import { PrefixedUrls, STOP_TYPE, Urls } from "../../../constants";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";

interface StopScreenHandlerViewData extends BaseViewData {}

export class StopScreenHandler extends GenericHandler<BaseViewData> {

    private static templateBasePath = "router_views/stop_screen/";

    public async getViewData (req: Request, res: Response): Promise<StopScreenHandlerViewData> {

        const baseViewData = await super.getViewData(req, res);
        const stopType = req.query.stopType as string;

        return setContent(req, stopType, baseViewData);
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<StopScreenHandlerViewData>> {
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: StopScreenHandler.templateBasePath + req.query.stopType,
            viewData
        };
    }
}

const setContent = async (req: Request, stopType: string, baseViewData: BaseViewData) => {

    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    switch (stopType) {
    case STOP_TYPE.DOB_MISMATCH: {
        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: resolveUrlTemplate(PrefixedUrls.STOP_SCREEN_DOB_MISMATCH),
            backURL: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
            templateName: Urls.STOP_SCREEN_DOB_MISMATCH,
            backLinkDataEvent: "personal-code-back-link"
        };
    }
    default: {
        throw Error("Unrecognised stop screen type: " + stopType);
    }
    }

    function resolveUrlTemplate (prefixedUrl: string): string | null {
        return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { lang });
    }

};

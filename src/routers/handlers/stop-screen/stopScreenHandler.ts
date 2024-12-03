import { Request, Response } from "express";
import { PrefixedUrls, STOP_TYPE, toStopScreenPrefixedUrl } from "../../../constants";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { env } from "../../../config";

interface StopScreenHandlerViewData extends BaseViewData {
    extraData?: string[];
}

export class StopScreenHandler extends GenericHandler<StopScreenHandlerViewData> {

    private static templateBasePath = "router_views/stop_screen/";

    public async getViewData (req: Request, res: Response): Promise<StopScreenHandlerViewData> {

        const baseViewData = await super.getViewData(req, res);
        const stopType = req.params?.stopType as STOP_TYPE;

        return setContent(req, stopType, baseViewData);
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<StopScreenHandlerViewData>> {
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: StopScreenHandler.templateBasePath + req.params?.stopType,
            viewData
        };
    }
}

const setContent = async (req: Request, stopType: STOP_TYPE, baseViewData: BaseViewData) => {

    const companyNumber = req.query.companyNumber as string;
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();
    const stopScreenPrefixedUrl = toStopScreenPrefixedUrl(stopType);

    switch (stopType) {
        case STOP_TYPE.SUPER_SECURE: {
            return {
                ...baseViewData,
                ...getLocaleInfo(locales, lang),
                templateName: stopType,
                currentUrl: resolveUrlTemplate(stopScreenPrefixedUrl, stopType),
                backURL: addSearchParams(PrefixedUrls.CONFIRM_COMPANY, { companyNumber, lang }),
                backLinkDataEvent: "super-secure-back-link",
                extraData: [env.DSR_EMAIL_ADDRESS, env.DSR_PHONE_NUMBER]
            };
        }
        case STOP_TYPE.PSC_DOB_MISMATCH: {
            return {
                ...baseViewData,
                ...getLocaleInfo(locales, lang),
                templateName: stopType,
                currentUrl: resolveUrlTemplate(stopScreenPrefixedUrl, stopType),
                backURL: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
                backLinkDataEvent: "psc-dob-mismatch-back-link",
                extraData: [resolveUrlTemplate(stopScreenPrefixedUrl, STOP_TYPE.RP01_GUIDANCE)]
            };
        }
        case STOP_TYPE.RP01_GUIDANCE: {
            return {
                ...baseViewData,
                ...getLocaleInfo(locales, lang),
                templateName: stopType,
                currentUrl: resolveUrlTemplate(stopScreenPrefixedUrl, stopType),
                backURL: resolveUrlTemplate(stopScreenPrefixedUrl, STOP_TYPE.PSC_DOB_MISMATCH),
                backLinkDataEvent: "rp01-guidance-back-link",
                extraData: [env.GET_RP01_LINK, env.GET_PSC01_LINK, env.POST_TO_CH_LINK, PrefixedUrls.START]
            };
        }
        default: {
            throw new Error("Unrecognised stop screen type: " + stopType);
        }

    }

    function resolveUrlTemplate (prefixedUrl: string, stopType?: STOP_TYPE): string {
        const url = stopType ? getUrlWithStopType(prefixedUrl, stopType) : prefixedUrl;

        return addSearchParams(getUrlWithTransactionIdAndSubmissionId(url, req.params.transactionId, req.params.submissionId), { lang });
    }

};
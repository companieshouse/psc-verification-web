import { Request, Response } from "express";
import { PrefixedUrls, STOP_TYPE, toStopScreenPrefixedUrl } from "../../../constants";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithStopType, getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { env } from "../../../config";
import { getLocalesService } from "../../../middleware/localise";

interface StopScreenHandlerViewData extends BaseViewData {
    extraData?: string[];
}

export class StopScreenHandler extends GenericHandler<StopScreenHandlerViewData> {

    private static readonly templateBasePath = "router_views/stopScreen/";

    public async getViewData (req: Request, res: Response): Promise<StopScreenHandlerViewData> {

        const baseViewData = await super.getViewData(req, res);
        const stopType = req.params?.stopType as STOP_TYPE;

        return setContent(req, res, stopType, baseViewData);
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<StopScreenHandlerViewData>> {
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: StopScreenHandler.templateBasePath + req.params?.stopType,
            viewData
        };
    }
}

const setContent = async (req: Request, res: Response, stopType: STOP_TYPE, baseViewData: BaseViewData) => {

    const companyNumber = req.query.companyNumber as string;
    const lang = res.locals.locale.lang;
    const locales = getLocalesService();
    const companyProfile = res.locals.companyProfile;
    const companyName = companyProfile?.companyName;
    const stopScreenPrefixedUrl = toStopScreenPrefixedUrl(stopType);

    switch (stopType) {
        case STOP_TYPE.COMPANY_STATUS:
        case STOP_TYPE.COMPANY_TYPE:
            return {
                ...baseViewData,
                ...res.locals.locale,
                templateName: stopType,
                currentUrl: addSearchParams(getUrlWithStopType(stopScreenPrefixedUrl, stopType), { companyNumber, lang }),
                backURL: addSearchParams(resolveUrlTemplate(PrefixedUrls.CONFIRM_COMPANY), { companyNumber }),
                extraData: [companyName, resolveUrlTemplate(PrefixedUrls.COMPANY_NUMBER), env.CONTACT_US_LINK]
            };
        case STOP_TYPE.EMPTY_PSC_LIST: {
            return {
                ...baseViewData,
                ...res.locals.locale,
                templateName: stopType,
                currentUrl: addSearchParams(getUrlWithStopType(stopScreenPrefixedUrl, stopType), { companyNumber, lang }),
                backURL: addSearchParams(PrefixedUrls.CONFIRM_COMPANY, { companyNumber, lang })
            };
        }
        case STOP_TYPE.PSC_DOB_MISMATCH: {
            return {
                ...baseViewData,
                ...res.locals.locale,
                templateName: stopType,
                currentUrl: resolveUrlTemplate(stopScreenPrefixedUrl, stopType),
                backURL: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE),
                extraData: [env.GET_RP01_LINK, env.WEBFILING_LOGIN_URL]
            };
        }
        case STOP_TYPE.SUPER_SECURE: {
            return {
                ...baseViewData,
                ...res.locals.locale,
                templateName: stopType,
                currentUrl: addSearchParams(getUrlWithStopType(stopScreenPrefixedUrl, stopType), { companyNumber, lang }),
                backURL: addSearchParams(PrefixedUrls.CONFIRM_COMPANY, { companyNumber, lang }),
                extraData: [env.DSR_EMAIL_ADDRESS, env.DSR_PHONE_NUMBER]
            };
        }
        case STOP_TYPE.PROBLEM_WITH_PSC_DATA: {
            return {
                ...baseViewData,
                ...res.locals.locale,
                templateName: stopType,
                currentUrl: addSearchParams(getUrlWithStopType(stopScreenPrefixedUrl, stopType), { companyNumber, lang }),
                extraData: [env.ENQUIRIES_EMAIL_ADDRESS, env.ENQUIRIES_PHONE_NUMBER]
            };
        }
        default: {
            throw new Error("Unrecognised stop screen type: " + stopType);
        }

    }

    function resolveUrlTemplate (prefixedUrl: string, templateName?: STOP_TYPE): string {
        const url = templateName ? getUrlWithStopType(prefixedUrl, templateName) : prefixedUrl;

        return addSearchParams(getUrlWithTransactionIdAndSubmissionId(url, req.params.transactionId, req.params.submissionId), { lang });
    }

};

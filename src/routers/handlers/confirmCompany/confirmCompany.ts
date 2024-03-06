import { Request, Response } from "express";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";
import logger from "../../../lib/Logger";
import { PrefixedUrls } from "../../../constants";
import { selectLang, getLocalesService, getLocaleInfo } from "../../../utils/localise";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../../services/external/company.profile.service";

interface ConfirmCompanyViewData extends BaseViewData {
}

export class ConfirmCompanyHandler extends GenericHandler<ConfirmCompanyViewData> {

    private static templatePath = "router_views/confirmCompany/confirmCompany";

    public getViewData (req: Request): ConfirmCompanyViewData {

        const baseViewData = super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "Confirm Company",
            currentUrl: PrefixedUrls.CONFIRM_COMPANY,
            backURL: PrefixedUrls.START
        };
    }

    public executeGet (req: Request, _response: Response): ViewModel<ConfirmCompanyViewData> {
        logger.info(`ConfirmCompanyHandler execute called`);

        const companyNumber = req.query.companyNumber as string;
        // const companyProfile: Promise<CompanyProfile> = getCompanyProfile(companyNumber);

        const viewData = this.getViewData(req);

        return {
            templatePath: ConfirmCompanyHandler.templatePath,
            viewData
        };
    }
}

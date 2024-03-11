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
import { getCompanyProfile } from "../../../services/external/companyProfileService";

interface ConfirmCompanyViewData extends BaseViewData {
    company: CompanyProfile
}

export class ConfirmCompanyHandler extends GenericHandler<ConfirmCompanyViewData> {

    private static templatePath = "router_views/confirmCompany/confirmCompany";

    public async getViewData (req: Request): Promise<ConfirmCompanyViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        const companyNumber = req.query.companyNumber as string;
        const company: CompanyProfile = await getCompanyProfile(companyNumber);

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: PrefixedUrls.CONFIRM_COMPANY,
            backURL: PrefixedUrls.START,
            company
        };
    }

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<ConfirmCompanyViewData>> {
        logger.info(`ConfirmCompanyHandler execute called`);

        const viewData = await this.getViewData(req);

        return {
            templatePath: ConfirmCompanyHandler.templatePath,
            viewData
        };
    }
}

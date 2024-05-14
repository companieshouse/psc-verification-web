import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { Request, Response } from "express";
import { ExternalUrls, PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getCompanyProfile } from "../../../services/companyProfileService";
import { buildAddress, formatForDisplay } from "../../../services/confirmCompanyService";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";

interface ConfirmCompanyViewData extends BaseViewData {
    company: CompanyProfile
    address: String
}

export class ConfirmCompanyHandler extends GenericHandler<ConfirmCompanyViewData> {

    private static templatePath = "router_views/confirmCompany/confirmCompany";

    public async getViewData (req: Request): Promise<ConfirmCompanyViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        const companyProfile: CompanyProfile = await getCompanyProfile(req);
        const company = formatForDisplay(companyProfile, locales, lang);
        const address = buildAddress(companyProfile);
        const currentUrl = addSearchParams(PrefixedUrls.CONFIRM_COMPANY, { companyNumber: companyProfile.companyNumber, lang });
        const forward = decodeURI(addSearchParams(ExternalUrls.COMPANY_LOOKUP_FORWARD, { companyNumber: "{companyNumber}", lang }));
        // addSearchParams() encodes the URI, so need to decode value before second call
        const companyLookup = addSearchParams(ExternalUrls.COMPANY_LOOKUP, { forward });

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl,
            backURL: companyLookup,
            company,
            address
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

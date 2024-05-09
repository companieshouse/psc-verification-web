import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
// import { CompanyPersonWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
// import { getCompanyIndividualPscList } from "services/companyPscService";

interface PscIndividualListViewData extends BaseViewData {
    companyName: String
    pscIndividuals: Map <String, Date>
}
export class IndividualPscListHandler extends GenericHandler<PscIndividualListViewData> {

    private static templatePath = "router_views/individualPscList/individualPscList";

    public async getViewData (req: Request): Promise<PscIndividualListViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const queryParams = new URLSearchParams(req.url.split("?")[1]);
        // hard-coded temporarily
        const companyName = "THE GIRLS' DAY SCHOOL TRUST";
        // const individualPscList: CompanyPersonWithSignificantControlResource[] = await getCompanyIndividualPscList(req, companyNumber);
        const pscIndividuals = new Map();
        pscIndividuals.set("Paul Smith", "2019");

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`,
            backURL: `${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, req.params.transactionId, req.params.submissionId)}?${queryParams}`,
            companyName,
            pscIndividuals
        };
    }

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<PscIndividualListViewData>> {
        logger.info(`IndividualPscListHandler execute called`);

        const viewData = await this.getViewData(req);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }

}

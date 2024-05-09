import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
interface IndividualPscData {
    name: String;
    dob: String;
}

interface IndividualPscListViewData extends BaseViewData {
    pscIndividuals: IndividualPscData[],
    companyName: String
}

export class IndividualPscListHandler extends GenericHandler<IndividualPscListViewData> {

    private static templatePath = "router_views/individualPscList/individualPscList";

    public async getViewData (req: Request): Promise<IndividualPscListViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const queryParams = new URLSearchParams(req.url.split("?")[1]);
        // hard-coded temporarily
        const companyName = "THE GIRLS' DAY SCHOOL TRUST";
        // const individualPscList: CompanyPersonWithSignificantControlResource[] = await getCompanyIndividualPscList(req, companyName);
        const pscIndividuals: IndividualPscData[] = [
            { name: "Paul Smith", dob: "1999" },
            { name: "Bertie Bassett", dob: "2008" },
            { name: "Mellow Yellow", dob: "2004" }
        ];

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: `${PrefixedUrls.INDIVIDUAL_PSC_LIST}?${queryParams}`,
            backURL: `${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, req.params.transactionId, req.params.submissionId)}?${queryParams}`,
            companyName,
            pscIndividuals
        };
    }

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<IndividualPscListViewData>> {
        logger.info(`IndividualPscListHandler execute called`);

        const viewData = await this.getViewData(req);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }

}

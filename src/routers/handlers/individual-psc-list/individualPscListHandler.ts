import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { CompanyPersonWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { getCompanyIndividualPscList } from "../../../services/companyPscService";

interface IndividualPscData {
    pscId: string | any;
    name: string;
    dob: { year: number | any; month: string | any};
}

interface IndividualPscListViewData extends BaseViewData {
    pscIndividuals: IndividualPscData[],
    companyName: string
}

export class IndividualPscListHandler extends GenericHandler<IndividualPscListViewData> {

    private static templatePath = "router_views/individualPscList/individualPscList";

    public async getViewData (req: Request, res: Response): Promise<IndividualPscListViewData> {

        const baseViewData = await super.getViewData(req, res);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const verification = res.locals.submission;
        const companyNumber = verification?.data?.company_number as string;
        const companyProfile = res.locals.companyProfile;

        let companyName: string = "";
        if (companyProfile) {
            companyName = companyProfile.companyName;
        }

        let individualPscList: CompanyPersonWithSignificantControlResource[] = [];
        if (companyNumber) {
            individualPscList = await getCompanyIndividualPscList(req, companyNumber);
        }

        const pscIndividuals : IndividualPscData[] = this.populatePscIndividualData(individualPscList, lang);
        const queryParams = new URLSearchParams(req.url.split("?")[1]);
        queryParams.set("lang", lang);
        queryParams.set("pscType", "individual");

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: `${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, req.params.transactionId, req.params.submissionId)}?${queryParams}`,
            backURL: `${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, req.params.transactionId, req.params.submissionId)}?${queryParams}`,
            companyName,
            pscIndividuals
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<IndividualPscListViewData>> {
        logger.info(`IndividualPscListHandler execute called`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, _response: Response) {
        const selectedPsc = req.body.pscId;
        logger.info("individualPscListRouter: selected PSC ID = " + selectedPsc);
        // TODO: patch the PSC to the verification in the DB
        // patchPscVerification(selectedStatements)
    }

    private populatePscIndividualData (individualPscList: CompanyPersonWithSignificantControlResource[], lang: string): IndividualPscData[] {
        const individualPscData: IndividualPscData[] = [];

        if (individualPscList) {
            for (let index = 0; index < individualPscList.length; index++) {
                const element: any = individualPscList[index];
                logger.debug(`individualPscListHandler: individualPscList element at index: ${index} = ${JSON.stringify(element)}`);

                // Note the PSC appointment ID is retrieved from the "self" link as there is no "psc_appointment_id"
                const pscId = element.links.self.split("/").pop();
                logger.info(`individualPscListHandler: retrieved pscId = ${JSON.stringify(pscId)}`);
                const dob = new Date(element.dateOfBirth.year, element.dateOfBirth.month);
                const formatter = new Intl.DateTimeFormat(lang, { month: "long" });
                const monthAsString = formatter.format(dob);

                const individualPscDataItem: IndividualPscData = { pscId: pscId, name: element.name, dob: { year: element.dateOfBirth.year, month: monthAsString } };
                individualPscData[index] = individualPscDataItem;
                logger.debug(`individualPscListHandler: FE individualPscDataItem = ${JSON.stringify(individualPscDataItem)}`);
            }
        }

        return individualPscData;
    }
}

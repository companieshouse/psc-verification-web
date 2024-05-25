import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { CompanyPersonWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { getCompanyIndividualPscList } from "../../../services/companyPscService";
import { getPscVerification, patchPscVerification } from "../../../services/pscVerificationService";
import { PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { Resource } from "@companieshouse/api-sdk-node";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../../../services/companyProfileService";

interface IndividualPscData {
    pscId: string | any;
    name: string;
    dob: { year: number | any; month: string | any};
    selectedPscId?: string;
}

interface IndividualPscListViewData extends BaseViewData {
    pscIndividuals: IndividualPscData[],
    companyName: string
}

export class IndividualPscListHandler extends GenericHandler<IndividualPscListViewData> {

    private static templatePath = "router_views/individualPscList/individualPscList";

    public async getViewData (req: Request): Promise<IndividualPscListViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        // Gets the JSON of the PSC
        const getResponse: Resource<PscVerificationResource> = await getPscVerification(req, req.params.transactionId, req.params.submissionId);
        const companyNumber = getResponse?.resource?.data?.company_number as string;
        req.query.companyNumber = companyNumber;
        const companyProfile: CompanyProfile = await getCompanyProfile(req, companyNumber);

        let companyName: string = "";
        if (companyProfile) {
            companyName = companyProfile.companyName;
        }

        let individualPscList: CompanyPersonWithSignificantControlResource[] = [];
        if (companyNumber) {
            individualPscList = await getCompanyIndividualPscList(req, companyNumber);
        }

        const selectedPscId = getResponse?.resource?.data?.psc_appointment_id as string;
        const pscIndividuals : IndividualPscData[] = this.populatePscIndividualData(individualPscList, selectedPscId, lang);
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

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<IndividualPscListViewData>> {
        logger.info(`IndividualPscListHandler.executeGet called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, _response: Response) {
        logger.info(`IndividualPscListHandler.executePost called`);

        if (req.params.transactionId && req.params.submissionId && req.body.pscId) {
            logger.debug(`individualPscListRouter.executePost: patching submission resource for submissionId=${req.params.submissionId} with PSC ID: ${req.body.pscId}`);
            const response = await patchPscVerification(req, req.params.transactionId, req.params.submissionId, { psc_appointment_id: req.body.pscId });
        }

        logger.debug(`IndividualPscListHandler.executePost exiting`);
    }

    private populatePscIndividualData (individualPscList: CompanyPersonWithSignificantControlResource[], selectedPscId: string, lang: string): IndividualPscData[] {
        const individualPscData: IndividualPscData[] = [];

        if (individualPscList) {
            for (let index = 0; index < individualPscList.length; index++) {
                const element: any = individualPscList[index];
                logger.debug(`individualPscListHandler: individualPscList element at index: ${index} = ${JSON.stringify(element)}`);

                // Note the PSC appointment ID is retrieved from the "self" link as there is no "psc_appointment_id"
                const pscId = element.links.self.split("/").pop();
                logger.debug(`individualPscListHandler: retrieved pscId = ${JSON.stringify(pscId)}`);
                const dob = new Date(element.dateOfBirth.year, element.dateOfBirth.month);
                const formatter = new Intl.DateTimeFormat(lang, { month: "long" });
                const monthAsString = formatter.format(dob);

                const individualPscDataItem: IndividualPscData = { pscId: pscId, name: element.name, dob: { year: element.dateOfBirth.year, month: monthAsString }, selectedPscId: selectedPscId };
                individualPscData[index] = individualPscDataItem;
                logger.debug(`individualPscListHandler: FE individualPscDataItem = ${JSON.stringify(individualPscDataItem)}`);
            }
        }

        return individualPscData;
    }
}

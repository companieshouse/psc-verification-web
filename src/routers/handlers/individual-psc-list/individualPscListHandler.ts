import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { getCompanyIndividualPscList } from "../../../services/companyPscService";
import { patchPscVerification } from "../../../services/pscVerificationService";
import { formatDateBorn } from "../../utils";

interface PartialDate {
    year: string | number,
    month: string | number
}

interface RadioButtonData {
    text: string,
    value: string,
    attributes: { [attr: string]: string},
    hint?: {
        text: string
    },
}
interface IndividualPscListViewData extends BaseViewData {
    companyName: string,
    pscRadioItems: RadioButtonData[],
    selectedPscId: string
}

export class IndividualPscListHandler extends GenericHandler<IndividualPscListViewData> {

    private static templatePath = "router_views/individualPscList/individualPscList";

    public async getViewData (req: Request, res: Response): Promise<IndividualPscListViewData> {

        const baseViewData = await super.getViewData(req, res);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const verification = res.locals.submission;
        const companyNumber = verification?.data?.companyNumber as string;
        const companyProfile = res.locals.companyProfile;

        let companyName: string = "";
        if (companyProfile) {
            companyName = companyProfile.companyName;
        }

        let individualPscList: CompanyPersonWithSignificantControl[] = [];
        if (companyNumber) {
            individualPscList = await getCompanyIndividualPscList(req, companyNumber);
        }

        const selectedPscId = verification?.data?.pscAppointmentId as string;
        const queryParams = new URLSearchParams(req.url.split("?")[1]);
        queryParams.set("lang", lang);
        queryParams.set("pscType", "individual");

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: `${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, req.params.transactionId, req.params.submissionId)}?${queryParams}`,
            backURL: `${getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_TYPE, req.params.transactionId, req.params.submissionId)}?${queryParams}`,
            companyName,
            pscRadioItems: this.getPscIndividualRadioItems(individualPscList, lang),
            selectedPscId,
            templateName: Urls.INDIVIDUAL_PSC_LIST,
            backLinkDataEvent: "psc-list-back-link"
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<IndividualPscListViewData>> {
        logger.info(`${IndividualPscListHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, _response: Response) {
        logger.info(`${IndividualPscListHandler.name} - ${this.executePost.name} called for transaction: ${req.params?.transactionId} and submissionId: ${req.params?.submissionId}`);

        const pscSelected = req.body.pscSelect;
        logger.debug(`${IndividualPscListHandler.name} - ${this.executePost.name} - patching submission resource for transaction: ${req.params.transactionId} and submissionId: ${req.params.submissionId} with PSC ID: ${pscSelected}`);
        await patchPscVerification(req, req.params.transactionId, req.params.submissionId, { pscAppointmentId: pscSelected });

        const lang = selectLang(req.query.lang);
        const queryParams = new URLSearchParams(req.url.split("?")[1]);
        queryParams.set("lang", lang);

        const nextPageUrl = getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PERSONAL_CODE, req.params.transactionId, req.params.submissionId);
        return (`${nextPageUrl}?${queryParams}`);
    }

    private getPscIndividualRadioItems (individualPscList: CompanyPersonWithSignificantControl[], lang: string): RadioButtonData[] {
        return individualPscList.map(psc => {
            const hintText = this.formatHintText(psc.dateOfBirth, lang, psc);

            return {
                value: psc.links.self.split("/").pop() as string,
                text: psc.name,
                attributes: { "data-event-id": "selected-PSC-radio-option" },
                hint: hintText ? {
                    text: hintText
                } : undefined
            };
        });
    }

    private formatHintText (dob: PartialDate, lang: string, psc: CompanyPersonWithSignificantControl) {
        return `${getLocalesService().i18nCh.resolveSingleKey("individual_psc_list_born_in", lang)} ${formatDateBorn(dob, lang)}`;
    }
}

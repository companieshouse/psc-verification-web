import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { getCompanyIndividualPscList } from "../../../services/companyPscService";
import { patchPscVerification } from "../../../services/pscVerificationService";
import { formatDateBorn, internationaliseDate } from "../../utils";
import { env } from "../../../config";

interface PscListData {
    pscId: string,
    pscName: string,
    pscDob: string,
    pscVerificationDeadlineDate: string
}

interface IndividualPscListViewData extends BaseViewData {
    companyName: string,
    confirmationStatementDate: string,
    dsrEmailAddress: string,
    dsrPhoneNumber: string,
    pscDetails: PscListData[],
    selectedPscId: string | null,
    nextPageUrl: string | null
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
        const dsrEmailAddress = env.DSR_EMAIL_ADDRESS;
        const dsrPhoneNumber = env.DSR_PHONE_NUMBER;

        let companyName: string = "";
        let confirmationStatementDate: string = "";

        if (companyProfile) {
            companyName = companyProfile.companyName;
            if (companyProfile.confirmationStatement) {
                confirmationStatementDate = internationaliseDate(companyProfile.confirmationStatement.nextMadeUpTo, lang);
            }
        }

        let individualPscList: CompanyPersonWithSignificantControl[] = [];
        if (companyNumber) {
            individualPscList = await getCompanyIndividualPscList(req, companyNumber);
        }

        const selectedPscId = verification?.data?.pscAppointmentId as string;
        const pscType = "individual";

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: resolveUrlTemplate(PrefixedUrls.INDIVIDUAL_PSC_LIST),
            backURL: resolveUrlTemplate(PrefixedUrls.PSC_TYPE),
            nextPageUrl: resolveUrlTemplate(PrefixedUrls.PERSONAL_CODE) + "&selectedPscId=",
            companyName,
            confirmationStatementDate,
            dsrEmailAddress,
            dsrPhoneNumber,
            pscDetails: this.getPscDetails(individualPscList, lang),
            selectedPscId,
            templateName: Urls.INDIVIDUAL_PSC_LIST,
            backLinkDataEvent: "psc-list-back-link"
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(getUrlWithTransactionIdAndSubmissionId(prefixedUrl, req.params.transactionId, req.params.submissionId), { lang, pscType });
        }
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

    private getPscDetails (individualPscList: CompanyPersonWithSignificantControl[], lang: string): PscListData[] {
        return individualPscList.map(psc => {
            const pscFormattedDob = `${formatDateBorn(psc.dateOfBirth, lang)}`;

            return {
                pscId: psc.links.self.split("/").pop() as string,
                pscName: psc.name,
                pscDob: pscFormattedDob,
                pscVerificationDeadlineDate: "[pscVerificationDate]"
            };
        });
    }
}

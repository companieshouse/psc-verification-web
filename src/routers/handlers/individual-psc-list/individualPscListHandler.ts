import { Request, Response } from "express";
import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { getCompanyIndividualPscList } from "../../../services/companyPscService";
import { PSC_KIND_TYPE, PrefixedUrls, Urls } from "../../../constants";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn, internationaliseDate } from "../../utils";
import { env } from "../../../config";
import { logger } from "../../../lib/logger";
import { getPscIndividual } from "../../../services/pscService";
import { PersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/psc/types";

interface PscListData {
    pscId: string,
    pscCeasedOn?: string,
    pscKind?: string,
    pscName?: string,
    pscDob?: string,
    pscVerificationStartDate: string,
    pscVerificationDeadlineDate: string,
    pscSortName?: string,
}

interface IndividualPscListViewData extends BaseViewData {
    companyName: string,
    dsrEmailAddress: string,
    dsrPhoneNumber: string,
    idvImplementationDate: string,
    canVerifyNowDetails: PscListData[],
    canVerifyLaterDetails: PscListData[],
    verifiedPscDetails: PscListData[],
    exclusivelySuperSecure: boolean,
    selectedPscId: string | null,
    showNoPscsMessage: boolean,
    nextPageUrl: string | null
}

export class IndividualPscListHandler extends GenericHandler<IndividualPscListViewData> {

    private static readonly templatePath = "router_views/individualPscList/individual-psc-list";

    public async getViewData (req: Request, res: Response): Promise<IndividualPscListViewData> {

        const baseViewData = await super.getViewData(req, res);
        const lang = res.locals.lang;
        const companyNumber = req.query.companyNumber as string;
        const companyProfile = res.locals.companyProfile;
        const dsrEmailAddress = env.DSR_EMAIL_ADDRESS;
        const dsrPhoneNumber = env.DSR_PHONE_NUMBER;
        const idvDate = env.IDV_IMPLEMENTATION_DATE; // "yyyymmdd"
        const idvDateFormatted = [idvDate.slice(0, 4), idvDate.slice(4, 6), idvDate.slice(6, 8)].join("-"); // yyyy-mm-dd

        const companyName = companyProfile?.companyName ?? "";

        const individualPscListWithVerificationState: PersonWithSignificantControl[] = await this.getIndividualPscListWithVerificationState(companyNumber, req);

        const verifiedPscList = individualPscListWithVerificationState.filter(psc => psc.verificationState?.verificationStatus === "VERIFIED");
        const unverifiedPscList = individualPscListWithVerificationState.filter(psc => psc.verificationState?.verificationStatus !== "VERIFIED" || psc.verificationState === undefined);

        const canVerifyNow = unverifiedPscList.filter(psc => (psc.verificationState?.verificationStartDate !== undefined && new Date(psc.verificationState.verificationStartDate) <= new Date()) || psc.verificationState === undefined);
        const canVerifyLater = unverifiedPscList.filter(psc => psc.verificationState?.verificationStartDate !== undefined && new Date(psc.verificationState?.verificationStartDate) > new Date());

        const canVerifyNowDetails = this.getViewPscDetails(canVerifyNow, lang);
        const canVerifyLaterDetails = this.getViewPscDetails(canVerifyLater, lang);
        const verifiedPscDetails = this.getViewPscDetails(verifiedPscList, lang);

        const allSuperSecure = individualPscListWithVerificationState.every(psc => psc.kind !== undefined && psc.kind === PSC_KIND_TYPE.SUPER_SECURE as unknown as typeof psc.kind);
        const allCeased = individualPscListWithVerificationState.every(psc => psc.ceasedOn != null);
        const exclusivelySuperSecure = individualPscListWithVerificationState.length > 0 && (allSuperSecure && !allCeased);
        const showNoPscsMessage = individualPscListWithVerificationState.length === 0 || allCeased;

        return {
            ...baseViewData,
            currentUrl: resolveUrlTemplate(PrefixedUrls.INDIVIDUAL_PSC_LIST),
            backURL: resolveUrlTemplate(PrefixedUrls.CONFIRM_COMPANY),
            nextPageUrl: resolveUrlTemplate(PrefixedUrls.NEW_SUBMISSION) + "&selectedPscId=",
            companyName,
            dsrEmailAddress,
            dsrPhoneNumber,
            idvImplementationDate: internationaliseDate(idvDateFormatted, lang),
            canVerifyNowDetails: canVerifyNowDetails.filter(psc => psc.pscKind === PSC_KIND_TYPE.INDIVIDUAL),
            canVerifyLaterDetails: canVerifyLaterDetails.filter(psc => psc.pscKind === PSC_KIND_TYPE.INDIVIDUAL),
            verifiedPscDetails: verifiedPscDetails.filter(psc => psc.pscKind === PSC_KIND_TYPE.INDIVIDUAL),
            exclusivelySuperSecure,
            showNoPscsMessage,
            templateName: Urls.INDIVIDUAL_PSC_LIST
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(prefixedUrl, { companyNumber, lang });
        }
    }

    private async getIndividualPscListWithVerificationState (companyNumber: string, req: Request): Promise<PersonWithSignificantControl[]> {
        let individualPscList: CompanyPersonWithSignificantControl[] = [];
        const individualPscListWithVerificationState: PersonWithSignificantControl[] = [];
        if (companyNumber) {
            individualPscList = await getCompanyIndividualPscList(req, companyNumber);
            for (const psc of individualPscList) {
                try {
                    const individualDetails = await getPscIndividual(req, companyNumber, this.getPscIdFromSelfLink(psc));
                    if (individualDetails.resource) {
                        individualPscListWithVerificationState.push(individualDetails.resource);
                    }
                } catch (error) {
                    // not able to add the verification state to the PSC object, but we still add the PSC object to the list
                    // this is to ensure that the user can still see the PSC in the list, and submit a verification
                    logger.error(`Error getting PSC individual details: ${error}`);
                    individualPscListWithVerificationState.push(psc as PersonWithSignificantControl);
                }
            }
        }
        return individualPscListWithVerificationState;
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<IndividualPscListViewData>> {
        logger.info(`called`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }

    private getViewPscDetails (individualPscListWithVerificationState: PersonWithSignificantControl[], lang: string): PscListData[] {
        return individualPscListWithVerificationState.map(psc => {
            const pscFormattedDob = `${formatDateBorn(psc.dateOfBirth, lang)}`;
            const pscSortName = [psc.nameElements?.surname, psc.nameElements?.forename, psc.nameElements?.otherForenames, psc.nameElements?.middleName]
                .filter(name => name)
                .join(" "); // ensure single space between names even if some are missing

            return {
                pscId: psc.links.self.split("/").pop() as string,
                pscCeasedOn: psc.ceasedOn,
                pscKind: psc.kind,
                pscName: psc.name,
                pscDob: pscFormattedDob,
                pscVerificationStartDate: psc.verificationState?.verificationStartDate === undefined ? "" : internationaliseDate(psc.verificationState?.verificationStartDate.toString(), lang),
                pscVerificationDeadlineDate: psc.verificationState?.verificationStatementDueDate === undefined ? "" : internationaliseDate(psc.verificationState?.verificationStatementDueDate.toString(), lang),
                pscSortName
            };
        });
    }

    private getPscIdFromSelfLink (psc: CompanyPersonWithSignificantControl): string {
        return psc.links.self.split("/").pop() as string;
    }

}

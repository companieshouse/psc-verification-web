import { Request, Response } from "express";
import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { getCompanyIndividualPscList } from "../../../services/companyPscService";
import { PSC_KIND_TYPE, ExternalUrls, PrefixedUrls, Urls } from "../../../constants";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
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
    requestExtensionUrl?: string,
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

// IDV status predicate: VERIFIED
export const pscIsVerified = (psc: PersonWithSignificantControl): boolean => {
    const verificationStartDate = psc.identityVerificationDetails?.appointmentVerificationStartOn;
    const verificationEndDate = psc.identityVerificationDetails?.appointmentVerificationEndOn;
    const startDateIsPast = verificationStartDate !== undefined && new Date(verificationStartDate) <= new Date();
    const endDateIsFuture = verificationEndDate !== undefined && new Date(verificationEndDate) > new Date();
    return startDateIsPast && endDateIsFuture;
};

// IDV status predicate: UNVERIFIED
export const pscIsUnverified = (psc: PersonWithSignificantControl): boolean => {
    return !pscIsVerified(psc);
};

// IDV status predicate: DUE
// NOTE: If a PSC has no verification statement date, they are considered due for verification
export const pscCanVerifyNow = (psc: PersonWithSignificantControl): boolean => {
    const verificationStatementDate = psc.identityVerificationDetails?.appointmentVerificationStatementDate;
    return verificationStatementDate === undefined || new Date(verificationStatementDate) <= new Date();
};

// IDV status predicate: NOT YET REQUIRED
export const pscCanVerifyLater = (psc: PersonWithSignificantControl): boolean => {
    return !pscCanVerifyNow(psc);
};

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

        const individualPscListWithIdvDetails: PersonWithSignificantControl[] = await this.getIndividualPscListWithIdvDetails(companyNumber, req);

        const verifiedPscList = individualPscListWithIdvDetails.filter(pscIsVerified);
        const unverifiedPscList = individualPscListWithIdvDetails.filter(pscIsUnverified);

        const canVerifyNow = unverifiedPscList.filter(pscCanVerifyNow);
        const canVerifyLater = unverifiedPscList.filter(pscCanVerifyLater);

        const canVerifyNowDetails = this.getViewPscDetails(canVerifyNow, lang, companyNumber); // pass company number to generate request extension link
        const canVerifyLaterDetails = this.getViewPscDetails(canVerifyLater, lang);
        const verifiedPscDetails = this.getViewPscDetails(verifiedPscList, lang);

        const allSuperSecure = individualPscListWithIdvDetails.every(psc => psc.kind !== undefined && psc.kind === PSC_KIND_TYPE.SUPER_SECURE as unknown as typeof psc.kind);
        const allCeased = individualPscListWithIdvDetails.every(psc => psc.ceasedOn != null);
        const exclusivelySuperSecure = individualPscListWithIdvDetails.length > 0 && (allSuperSecure && !allCeased);
        const showNoPscsMessage = individualPscListWithIdvDetails.length === 0 || allCeased;

        return {
            ...baseViewData,
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

    private async getIndividualPscListWithIdvDetails (companyNumber: string, req: Request): Promise<PersonWithSignificantControl[]> {
        let individualPscList: CompanyPersonWithSignificantControl[] = [];
        const individualPscListWithIdvDetails: PersonWithSignificantControl[] = [];
        if (companyNumber) {
            individualPscList = await getCompanyIndividualPscList(req, companyNumber);
            for (const psc of individualPscList) {
                try {
                    const individualDetails = await getPscIndividual(req, companyNumber, this.getPscIdFromSelfLink(psc));
                    if (individualDetails.resource) {
                        individualPscListWithIdvDetails.push(individualDetails.resource);
                    }
                } catch (error) {
                    // not able to add the identity verification details to the PSC object, but we still add the PSC object to the list
                    // this is to ensure that the user can still see the PSC in the list, and submit a verification
                    logger.error(`Error getting PSC individual details: ${error}`);
                    individualPscListWithIdvDetails.push(psc as PersonWithSignificantControl);
                }
            }
        }
        return individualPscListWithIdvDetails;
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<IndividualPscListViewData>> {
        logger.info(`called`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }

    private getViewPscDetails (individualPscListWithVerificationState: PersonWithSignificantControl[], lang: string, companyNumber?: string): PscListData[] {
        return individualPscListWithVerificationState.map(psc => {
            const selectedPscId = psc.links.self.split("/").pop() as string;
            const pscFormattedDob = `${formatDateBorn(psc.dateOfBirth, lang)}`;
            const pscSortName = [psc.nameElements?.surname, psc.nameElements?.forename, psc.nameElements?.otherForenames, psc.nameElements?.middleName]
                .filter(name => name)
                .join(" "); // ensure single space between names even if some are missing
            const idvDetails = psc.identityVerificationDetails;
            const requestExtensionUrl = companyNumber ? addSearchParams(env.PSC_EXTENSIONS_PATH, { companyNumber, selectedPscId, lang }) : undefined;

            return {
                pscId: selectedPscId,
                pscCeasedOn: psc.ceasedOn,
                pscKind: psc.kind,
                pscName: psc.name,
                pscDob: pscFormattedDob,
                pscVerificationStartDate: this.getLocalizedDate(idvDetails?.appointmentVerificationStatementDate, lang),
                pscVerificationDeadlineDate: this.getLocalizedDate(idvDetails?.appointmentVerificationStatementDueOn, lang),
                pscSortName,
                requestExtensionUrl
            };
        });
    }

    private getPscIdFromSelfLink (psc: CompanyPersonWithSignificantControl): string {
        return psc.links.self.split("/").pop() as string;
    }

    private getLocalizedDate (date: Date | undefined, lang: string): string {
        return date === undefined ? "" : internationaliseDate(date.toString(), lang);
    }

}

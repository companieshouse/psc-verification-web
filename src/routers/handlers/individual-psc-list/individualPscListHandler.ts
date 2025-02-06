import { Request, Response } from "express";
import { CompanyPersonWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { getCompanyIndividualPscList } from "../../../services/companyPscService";
import { PSC_KIND_TYPE, PrefixedUrls, Urls } from "../../../constants";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { formatDateBorn, internationaliseDate } from "../../utils";
import { env } from "../../../config";
import { logger } from "../../../lib/logger";

interface PscListData {
    pscId: string,
    pscCeasedOn?: string,
    pscKind?: string,
    pscName?: string,
    pscDob?: string,
    pscVerificationDeadlineDate: string
}

interface IndividualPscListViewData extends BaseViewData {
    companyName: string,
    confirmationStatementDate: string,
    dsrEmailAddress: string,
    dsrPhoneNumber: string,
    pscDetails: PscListData[],
    exclusivelySuperSecure: boolean,
    selectedPscId: string | null,
    showNoPscsMessage: boolean,
    nextPageUrl: string | null
}

export class IndividualPscListHandler extends GenericHandler<IndividualPscListViewData> {

    private static templatePath = "router_views/individualPscList/individual-psc-list";

    public async getViewData (req: Request, res: Response): Promise<IndividualPscListViewData> {

        const baseViewData = await super.getViewData(req, res);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const companyNumber = req.query.companyNumber as string;
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

        const allPscDetails = this.getViewPscDetails(individualPscList, lang);
        const allSuperSecure = allPscDetails.every((psc) => psc.pscKind === PSC_KIND_TYPE.SUPER_SECURE);
        const allCeased = allPscDetails.every((psc) => psc.pscCeasedOn != null);

        const exclusivelySuperSecure = allPscDetails.length > 0 && (allSuperSecure && !allCeased);
        const showNoPscsMessage = allPscDetails.length === 0 || allCeased;

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: resolveUrlTemplate(PrefixedUrls.INDIVIDUAL_PSC_LIST),
            backURL: resolveUrlTemplate(PrefixedUrls.CONFIRM_COMPANY),
            nextPageUrl: resolveUrlTemplate(PrefixedUrls.NEW_SUBMISSION) + "&selectedPscId=",
            companyName,
            confirmationStatementDate,
            dsrEmailAddress,
            dsrPhoneNumber,
            pscDetails: allPscDetails.filter(psc => psc.pscKind === PSC_KIND_TYPE.INDIVIDUAL),
            exclusivelySuperSecure,
            showNoPscsMessage,
            templateName: Urls.INDIVIDUAL_PSC_LIST
        };

        function resolveUrlTemplate (prefixedUrl: string): string | null {
            return addSearchParams(prefixedUrl, { companyNumber, lang });
        }
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<IndividualPscListViewData>> {
        logger.info(`${IndividualPscListHandler.name} - ${this.executeGet.name} `);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: IndividualPscListHandler.templatePath,
            viewData
        };
    }

    private getViewPscDetails (individualPscList: CompanyPersonWithSignificantControl[], lang: string): PscListData[] {
        return individualPscList.map(psc => {
            const pscFormattedDob = `${formatDateBorn(psc.dateOfBirth, lang)}`;

            return {
                pscId: psc.links.self.split("/").pop() as string,
                pscCeasedOn: psc.ceasedOn,
                pscKind: psc.kind,
                pscName: psc.name,
                pscDob: pscFormattedDob,
                pscVerificationDeadlineDate: "[pscVerificationDate]"
            };
        });
    }
}

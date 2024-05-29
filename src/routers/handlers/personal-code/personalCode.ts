import { Request, Response } from "express";
import { PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import {
    BaseViewData,
    GenericHandler,
    ViewModel
} from "../generic";
import { getPscIndividualDetails } from "../utils/pscIndividual";
import { formatDateBorn } from "../../utils";

interface PersonalCodeViewData extends BaseViewData {
    pscName: string,
    monthBorn: string
}

export class PersonalCodeHandler extends GenericHandler<PersonalCodeViewData> {

    private static templatePath = "router_views/personal_code/personal_code";

    public async getViewData (req: Request, res: Response): Promise<PersonalCodeViewData> {

        const baseViewData = await super.getViewData(req, res);
        const pscIndividual = await getPscIndividualDetails(req, req.params.transactionId, req.params.submissionId);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            pscName: pscIndividual.resource?.name!,
            monthBorn: formatDateBorn(pscIndividual.resource?.dateOfBirth, selectLang(req.query.lang)),
            currentUrl: addSearchParams(PrefixedUrls.PERSONAL_CODE, { lang }),
            backURL: addSearchParams(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, req.params.transactionId, req.params.submissionId), { lang }),
            templateName: Urls.PERSONAL_CODE,
            backLinkDataEvent: "personal-code-back-link"
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<PersonalCodeViewData>> {
        logger.info(`PersonalCodeHandler execute called`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: PersonalCodeHandler.templatePath,
            viewData
        };
    }

}

import { Request, Response } from "express";
import { PrefixedUrls } from "../../../constants";
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
    PscName: string,
    DateOfBirth: string
}

export class PersonalCodeHandler extends GenericHandler<PersonalCodeViewData> {

    private static templatePath = "router_views/personal_code/personal_code";

    public async getViewData (req: Request): Promise<PersonalCodeViewData> {

        const baseViewData = await super.getViewData(req);
        const pscIndividual = await getPscIndividualDetails(req, req.params.transactionId, req.params.submissionId);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            PscName: pscIndividual.resource?.name!,
            DateOfBirth: formatDateBorn(pscIndividual.resource?.dateOfBirth, selectLang(req.query.lang)),
            currentUrl: addSearchParams(PrefixedUrls.PERSONAL_CODE, { lang }),
            backURL: addSearchParams(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, req.params.transactionId, req.params.submissionId), { lang })
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<PersonalCodeViewData>> {
        logger.info(`PersonalCodeHandler execute called`);
        const viewData = await this.getViewData(req);

        return {
            templatePath: PersonalCodeHandler.templatePath,
            viewData
        };
    }

}

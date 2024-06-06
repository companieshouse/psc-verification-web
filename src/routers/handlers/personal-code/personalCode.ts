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
import { PscVerification, PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { patchPscVerification } from "../../../services/pscVerificationService";

interface PersonalCodeViewData extends BaseViewData {
    pscName: string,
    monthBorn: string,
    personalCode: string
}

export class PersonalCodeHandler extends GenericHandler<PersonalCodeViewData> {

    private static templatePath = "router_views/personal_code/personal_code";

    public async getViewData (req: Request, res: Response): Promise<PersonalCodeViewData> {

        const baseViewData = await super.getViewData(req, res);
        const pscIndividual = await getPscIndividualDetails(req, req.params.transactionId, req.params.submissionId);
        const verificationResource: PscVerificationResource = res.locals.submission;
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            pscName: pscIndividual.resource?.name!,
            monthBorn: formatDateBorn(pscIndividual.resource?.dateOfBirth, selectLang(req.query.lang)),
            personalCode: verificationResource?.data?.verification_details?.uvid || "",
            currentUrl: addSearchParams(PrefixedUrls.PERSONAL_CODE, { lang }),
            backURL: addSearchParams(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.INDIVIDUAL_PSC_LIST, req.params.transactionId, req.params.submissionId), { lang }),
            templateName: Urls.PERSONAL_CODE,
            backLinkDataEvent: "personal-code-back-link"
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<PersonalCodeViewData>> {
        logger.info(`${PersonalCodeHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId}`);
        const viewData = await this.getViewData(req, res);

        return {
            templatePath: PersonalCodeHandler.templatePath,
            viewData
        };
    }

    public async executePost (req: Request, res: Response) {
        logger.info(`${PersonalCodeHandler.name} - ${this.executePost.name} called for transaction: ${req.params?.transactionId}`);
        const uvid = req.body.personalCode;
        const verification: PscVerification = {
            verification_details: {
                uvid: uvid
            }
        };
        const resource = await patchPscVerification(req, req.params.transactionId, req.params.submissionId, verification);
    }
}

import { Request, Response } from "express";
import { getPscIndividual } from "../../../services/pscService";
import { closeTransaction } from "../../../services/transactionService";
import { ExternalUrls, PrefixedUrls, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";

interface PscVerifiedViewData extends BaseViewData {
    referenceNumber: string;
    companyName: string;
    companyNumber: string;
    pscName: string;
    companyLookupUrl: string;
    pscListUrl: string;
}

export class PscVerifiedHandler extends GenericHandler<PscVerifiedViewData> {

    private static templatePath = "router_views/pscVerified/psc-verified";

    public async getViewData (req: Request, res: Response): Promise<PscVerifiedViewData> {

        const baseViewData = await super.getViewData(req, res);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const transactionId = req.params.transactionId;
        const submissionId = req.params.submissionId;
        const verification = res.locals.submission;
        const companyNumber = verification?.data?.companyNumber as string;
        const companyProfile = res.locals.companyProfile;
        const pscNotificationId = verification?.data.pscNotificationId as string;
        const pscDetailsResponse = await getPscIndividual(companyNumber, pscNotificationId);
        const companyName = companyProfile.companyName as string;
        const forward = decodeURI(addSearchParams(ExternalUrls.COMPANY_LOOKUP_FORWARD, { companyNumber: "{companyNumber}", lang }));

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: addSearchParams(getUrlWithTransactionIdAndSubmissionId(PrefixedUrls.PSC_VERIFIED, transactionId, submissionId), { lang }),
            companyName: companyName,
            companyNumber: companyNumber,
            pscName: pscDetailsResponse.resource?.name!,
            referenceNumber: transactionId,
            pscListUrl: addSearchParams(PrefixedUrls.INDIVIDUAL_PSC_LIST, { companyNumber, lang }),
            companyLookupUrl: addSearchParams(ExternalUrls.COMPANY_LOOKUP, { forward }),
            templateName: Urls.PSC_VERIFIED
        };
    }

    public async executeGet (req: Request, res: Response): Promise<ViewModel<PscVerifiedViewData>> {
        logger.info(`${PscVerifiedHandler.name} - ${this.executeGet.name} called for transaction: ${req.params?.transactionId} and ${req.params?.submissionId}`);
        const viewData = await this.getViewData(req, res);

        await closeTransaction(req, req.params.transactionId, req.params.submissionId)
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
            // TODO: handle failure properly (redirect to Error Screen? TBC)
                console.log(err);
            });

        return {
            templatePath: PscVerifiedHandler.templatePath,
            viewData
        };
    }
}

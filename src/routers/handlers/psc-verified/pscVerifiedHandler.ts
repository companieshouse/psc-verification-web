import { Request, Response } from "express";
import { getPscIndividual } from "../../../services/pscService";
import { getPscVerification } from "../../../services/pscVerificationService";
import { getCompanyProfile } from "../../../services/companyProfileService";
import { closeTransaction } from "../../../services/transactionService";
import { ExternalUrls, PrefixedUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";

interface PscVerifiedViewData extends BaseViewData {
    referenceNumber: String;
    companyName: String;
    companyNumber: String;
    pscName: String;
    companyLookupUrl: String;
    createNewSubmissionUrl: String;
}

export class PscVerifiedHandler extends GenericHandler<PscVerifiedViewData> {

    private static templatePath = "router_views/pscVerified/pscVerified";

    public async getViewData (req: Request): Promise<PscVerifiedViewData> {

        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const transactionId = req.params.transactionId;
        const submissionId = req.params.submissionId;
        const verificationResponse = await getPscVerification(req, transactionId, submissionId);
        const companyNumber = verificationResponse.resource?.data.company_number as string;
        const pscAppointmentId = verificationResponse.resource?.data.psc_appointment_id as string;
        const [pscDetailsResponse, companyProfile] = await Promise.all([getPscIndividual(req, companyNumber, pscAppointmentId), getCompanyProfile(req, companyNumber)]);
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
            createNewSubmissionUrl: addSearchParams(PrefixedUrls.NEW_SUBMISSION, { companyNumber, lang }),
            companyLookupUrl: addSearchParams(ExternalUrls.COMPANY_LOOKUP, { forward })
        };
    }

    public async executeGet (
        req: Request,
        _response: Response
    ): Promise<ViewModel<PscVerifiedViewData>> {
        logger.info(`PscVerifiedHandler execute called`);
        const viewData = await this.getViewData(req);

        const closure = await closeTransaction(req, req.params.transactionId, req.params.submissionId)
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

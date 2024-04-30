import { Request, Response } from "express";
import { PrefixedUrls, SessionKeys } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";

interface PscTypeViewData extends BaseViewData { submission: PscVerificationResource, submissionId: string, pscType: string }

export class PscTypeHandler extends GenericHandler<PscTypeViewData> {

    private static templatePath = "router_views/psc_type/psc_type";

    public async getViewData (req: Request): Promise<PscTypeViewData> {
        const baseViewData = await super.getViewData(req);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const companyNumber = req.session?.getExtraData(SessionKeys.COMPANY_NUMBER) as string;

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
            currentUrl: addSearchParams(PrefixedUrls.PSC_TYPE, { lang }),
            backURL: addSearchParams(PrefixedUrls.CONFIRM_COMPANY, { companyNumber, lang })
        };
    }

    public async executeGet (req: Request, _response: Response): Promise<ViewModel<PscTypeViewData>> {
        logger.info(`PscTypeHandler execute called`);
        const viewData = await this.getViewData(req);

        viewData.submissionId = req.params.submissionId;
        // retrieve the submission from the request.locals (per express SOP)
        viewData.submission = _response.locals.submission;

        // determine the pscType value to check the correct radio button
        // Note: the rule logic here is provisional/uncomfirmed
        if (viewData?.submission?.data?.psc_appointment_id) {
            if (viewData?.submission?.data?.relevant_officer) {
                viewData.pscType = "rle";
            } else {
                viewData.pscType = "individual";
            }
        }

        return {
            templatePath: PscTypeHandler.templatePath,
            viewData
        };
    }
}

import { Request, Response } from "express";
import { PrefixedUrls, SessionKeys, Urls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { getLocaleInfo, getLocalesService, selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler, ViewModel } from "../generic";
import { PscVerificationFormsValidator } from "./../../../lib/validation/form-validators/pscVerification";
import { getUrlWithTransactionIdAndSubmissionId } from "../../../utils/url";
interface PscTypeViewData extends BaseViewData {
    pscType: string,
    nextPageUrl: string
}

export class PscTypeHandler extends GenericHandler<PscTypeViewData> {

    private static templatePath = "router_views/psc_type/psc_type";

    public async execute (req: Request, res: Response): Promise<ViewModel<PscTypeViewData>> {
        const viewData = await this.getViewData(req, res);
        try {
            logger.info(`PscTypeHandler execute called`);

            const lang = selectLang(req.body.lang);
            const selectedType = req.body.pscType;

            const queryParams = new URLSearchParams(req.url.split("?")[1]);
            queryParams.set("lang", lang);
            queryParams.set("pscType", req.body.pscType);
            const nextPagePath = getUrlWithTransactionIdAndSubmissionId(this.selectPscType(selectedType), req.params.transactionId, req.params.submissionId);
            viewData.nextPageUrl = `${nextPagePath}?${queryParams}`;

            viewData.pscType = req.query.pscType as string;

            if (req.method === "POST") {
                const validator = new PscVerificationFormsValidator();
                viewData.errors = await validator.validatePscType(req.body);
                await this.save(req.body);
            }
        } catch (err: any) {
            logger.error(`${req.method} error: problem handling PSC type request: ${err.message}`);
            viewData.errors = this.processHandlerException(err);
        }
        return {
            templatePath: PscTypeHandler.templatePath,
            viewData
        };
    }

    public async getViewData (req: Request, res: Response): Promise<PscTypeViewData> {
        const baseViewData = await super.getViewData(req, res);
        const lang = selectLang(req.query.lang);
        const locales = getLocalesService();
        const companyNumber = req.session?.getExtraData(SessionKeys.COMPANY_NUMBER) as string;

        return {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            title: "PSC type – Provide identity verification details for a PSC or relevant legal entity",
            currentUrl: addSearchParams(PrefixedUrls.PSC_TYPE, { lang }),
            backURL: addSearchParams(PrefixedUrls.CONFIRM_COMPANY, { companyNumber, lang }),
            templateName: Urls.PSC_TYPE,
            backLinkDataEvent: "psc-type-back-link"
        };
    }

    protected selectPscType = (pscType: any): string => {
        switch (pscType) {
        case "individual": return PrefixedUrls.INDIVIDUAL_PSC_LIST;
        case "rle": return PrefixedUrls.RLE_LIST;
        default: return PrefixedUrls.INDIVIDUAL_PSC_LIST;
        }
    };

    // call API service to save data here
    private save (payload: any): Object {
        return Promise.resolve(true);
    }
}

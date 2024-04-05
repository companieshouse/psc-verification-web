import { Request, Response } from "express";
import { ExternalUrls } from "../../../constants";
import { logger } from "../../../lib/Logger";
import { selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler } from "./../generic";
import { addSearchParams } from "../../../utils/queryParams";

export class CompanyNumberHandler extends GenericHandler<BaseViewData> {

    public execute (req: Request, _response: Response) {
        logger.info(`CompanyNumberHandler execute called`);

        const lang = req.query.lang;
        if (lang !== undefined && lang !== "") {
            const forward = decodeURI(addSearchParams(ExternalUrls.COMPANY_LOOKUP_FORWARD, { companyNumber: "{companyNumber}", lang: selectLang(lang) }));
            // addSearchParams() encodes the URI, so need to decode value before second call
            const companyLookup = addSearchParams(ExternalUrls.COMPANY_LOOKUP, { forward });

            logger.debug("Company number redirect: " + companyLookup);
            return _response.redirect(companyLookup);
        }
        return _response.redirect(ExternalUrls.COMPANY_LOOKUP);
    }
}

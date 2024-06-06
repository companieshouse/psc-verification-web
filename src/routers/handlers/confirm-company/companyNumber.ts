import { Request, Response } from "express";
import { ExternalUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler } from "./../generic";

export class CompanyNumberHandler extends GenericHandler<BaseViewData> {

    public execute (req: Request, _response: Response) {
        logger.info(`${CompanyNumberHandler.name} - ${this.execute.name} called`);

        const lang = selectLang(req.query.lang);
        const forward = decodeURI(addSearchParams(ExternalUrls.COMPANY_LOOKUP_FORWARD, { companyNumber: "{companyNumber}", lang }));
        // addSearchParams() encodes the URI, so need to decode value before second call
        const companyLookup = addSearchParams(ExternalUrls.COMPANY_LOOKUP, { forward });
        logger.debug(`${CompanyNumberHandler.name} - ${this.execute.name}: Company number redirect: ` + companyLookup);

        return _response.redirect(companyLookup);
    }
}

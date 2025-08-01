import { Request, Response } from "express";
import { ExternalUrls } from "../../../constants";
import { logger } from "../../../lib/logger";
import { selectLang } from "../../../utils/localise";
import { addSearchParams } from "../../../utils/queryParams";
import { BaseViewData, GenericHandler } from "./../generic";

export class CompanyNumberHandler extends GenericHandler<BaseViewData> {

    public execute (req: Request, res: Response) {
        logger.info(`called`);

        const lang = selectLang(req.query.lang);
        const forward = decodeURI(addSearchParams(ExternalUrls.COMPANY_LOOKUP_FORWARD, { companyNumber: "{companyNumber}", lang }));
        // addSearchParams() encodes the URI, so need to decode value before second call
        const companyLookup = addSearchParams(ExternalUrls.COMPANY_LOOKUP, { forward, lang });
        logger.debug(`Company number redirect: ` + companyLookup);

        return res.redirect(companyLookup);
    }
}

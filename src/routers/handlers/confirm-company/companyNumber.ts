import { Request, Response } from "express";
import { ExternalUrls } from "../../../constants";
import { logger } from "../../../lib/Logger";
import { selectLang } from "../../../utils/localise";
import { BaseViewData, GenericHandler } from "./../generic";

export class CompanyNumberHandler extends GenericHandler<BaseViewData> {

    public execute (req: Request, _response: Response) {
        logger.info(`CompanyNumberHandler execute called`);

        const lang = req.query.lang;
        if (lang !== undefined && lang !== "") {
            const companyLookup = ExternalUrls.COMPANY_LOOKUP_WITH_LANG + selectLang(lang);
            logger.debug("Company number redirect: " + companyLookup);
            return _response.redirect(companyLookup);
        }
        return _response.redirect(ExternalUrls.COMPANY_LOOKUP);
    }
}

import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { NextFunction, Request, Response } from "express";
import { COMPANY_STATUS_NOT_ALLOWED, COMPANY_TYPE_ALLOWED, getPscVerificationCompanyLists } from "../config/api.enumerations";
import { PrefixedUrls, STOP_TYPE } from "../constants";
import { logger } from "../lib/logger";
import { getUrlWithStopType } from "../utils/url";
import { addSearchParams } from "../utils/queryParams";

export const checkCompany = (req: Request, res: Response, next: NextFunction) => {
    const companyProfile: CompanyProfile = res.locals?.companyProfile;
    const companyNumber = companyProfile.companyNumber;
    const lang = req.query.lang as string;

    const companyStatusNotAllowed: string[] = getPscVerificationCompanyLists(COMPANY_STATUS_NOT_ALLOWED);
    const companyTypeAllowed: string[] = getPscVerificationCompanyLists(COMPANY_TYPE_ALLOWED);

    if (companyStatusNotAllowed.includes(companyProfile.companyStatus)) {
        logger.debug(`Company Status ${companyProfile.companyStatus} for company with companyNumber="${companyNumber}" is not allowed`);
        res.redirect(addSearchParams(getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.COMPANY_STATUS), { companyNumber, lang }));
    } else if (!companyTypeAllowed.includes(companyProfile.type)) {
        logger.debug(`Company Type ${companyProfile.type} for company with companyNumber="${companyNumber}" is not allowed`);
        res.redirect(addSearchParams(getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.COMPANY_TYPE), { companyNumber, lang }));
    } else {
        next();
    }

};

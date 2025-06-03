import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/companyProfileService";
import { handleExceptions } from "../utils/asyncHandler";

export const fetchCompany = handleExceptions(async (req: Request, res: Response, next: NextFunction) => {
    const companyNumber = res.locals.submission?.data?.companyNumber || req.query.companyNumber;

    if (companyNumber) {
        logger.debug(`Retrieving company profile for company with companyNumber="${companyNumber}" ...`);

        const response: CompanyProfile = await getCompanyProfile(req, companyNumber);
        // store the profile in the res.locals (per express SOP)
        res.locals.companyProfile = response;
    } else {
        logger.error(`Cannot retrieve company profile: No company number provided`);
    }
    next();
});

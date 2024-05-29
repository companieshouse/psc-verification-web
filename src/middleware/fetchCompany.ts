import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { getCompanyProfile } from "../services/companyProfileService";

export const fetchCompany = async (req: Request, res: Response, next: NextFunction) => {
    const companyNumber = res.locals.submission?.data?.company_number;

    if (companyNumber) {
        logger.debug(`Retrieving company profile for company number ${companyNumber} ...`);

        const response: CompanyProfile = await getCompanyProfile(req, companyNumber);
        // store the profile in the request.locals (per express SOP)
        res.locals.companyProfile = response;
    } else {
        logger.error("Cannot retrieve company profile: No company number found in submission resource");
    }
    next();
};
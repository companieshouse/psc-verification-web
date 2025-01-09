import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { NextFunction, Request, Response, Router } from "express";
import { PrefixedUrls, STOP_TYPE } from "../constants";
import { handleExceptions } from "../utils/asyncHandler";
import { addSearchParams } from "../utils/queryParams";
import { logger } from "../lib/logger";
import { getUrlWithStopType } from "../utils/url";
import { IndividualPscListHandler } from "./handlers/individual-psc-list/individualPscListHandler";

const individualPscListRouter: Router = Router({ mergeParams: true });

individualPscListRouter.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new IndividualPscListHandler();
    const companyProfile: CompanyProfile = res.locals?.companyProfile;
    const companyNumber = companyProfile.companyNumber;
    const lang = req.query.lang as string;
    const { templatePath, viewData } = await handler.executeGet(req, res);

    if (viewData.exclusivelySuperSecure) {
        logger.debug(`individualPscListRouter.get - PSCs are exclusively Super Secure for company number ${companyNumber}: paper filing is required`);
        res.redirect(addSearchParams(getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.SUPER_SECURE), { companyNumber, lang }));
    } else {
        res.render(templatePath, viewData);
    };
}));

export default individualPscListRouter;

import { PlannedMaintenance } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { checkPlannedMaintenance } from "../services/pscVerificationService";
import { handleExceptions } from "../utils/asyncHandler";

export const pscVerificationApiAvailable = handleExceptions(async (req: Request, res: Response, next: NextFunction) => {

    logger.debug(`${pscVerificationApiAvailable.name} - Service Availability check`);

    const response: ApiResponse<PlannedMaintenance> = await checkPlannedMaintenance(req);

    if (response.resource?.status === "OUT_OF_SERVICE") {
        res.render("error/403");
    } else {
        next();
    }

});

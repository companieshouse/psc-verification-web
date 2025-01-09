import { PlannedMaintenance } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { checkPlannedMaintenance } from "../services/pscVerificationService";
import { handleExceptions } from "../utils/asyncHandler";
import ServiceUnavailableHandler from "../routers/handlers/service-unavailable/serviceUnavailableHandler";
import { HttpStatusCode } from "axios";

export const serviceUnavailable = handleExceptions(async (req: Request, res: Response, next: NextFunction) => {

    logger.debug(`${serviceUnavailable.name} - Service Availability check`);

    const response: ApiResponse<PlannedMaintenance> = await checkPlannedMaintenance(req);

    if (response.resource?.status === "OUT_OF_SERVICE") {
        res.locals.maintenanceEndTime = response.resource?.maintenance_end_time;

        const handler = new ServiceUnavailableHandler();
        handler.executeGet(req, res).then((viewModel) => {
            const { templatePath, viewData } = viewModel;
            res.status(HttpStatusCode.NotFound).render(templatePath, viewData);
        });
    } else {
        next();
    }

});

import { NextFunction, Request, Response } from "express";
import { DataIntegrityError, DataIntegrityErrorType } from "../../lib/errors/dataIntegrityError";
import { HttpStatusCode } from "axios";
import { PrefixedUrls, STOP_TYPE } from "../../constants";
import { logger } from "../../lib/logger";
import { getUrlWithStopType } from "../../utils/url";

export function dataIntegrityErrorInterceptor (err: Error | DataIntegrityError, req: Request, res: Response, next: NextFunction): void {
    if (!(err instanceof DataIntegrityError)) {
        return next(err);
    }
    logger.error(`${err.name} (${err.type}): ${err.stack}`);

    switch (err.type) {
        case DataIntegrityErrorType.PSC_DATA:
            res.status(HttpStatusCode.InternalServerError);
            res.redirect(getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.PROBLEM_WITH_PSC_DATA));
            break;
        default:
            return next(new Error(`Unhandled DataIntegrityError type: ${err.type}`));
    }

    return next();
}

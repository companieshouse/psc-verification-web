import { NextFunction, Request, Response } from "express";
import { DataIntegrityError, DataIntegrityErrorType } from "../../lib/errors/dataIntegrityError";
import { HttpStatusCode } from "axios";
import { PrefixedUrls, STOP_TYPE } from "../../constants";
import { getUrlWithStopType } from "../../utils/url";
import { logger } from "../../lib/logger";
import { addSearchParams } from "../../utils/queryParams";

export function dataIntegrityErrorInterceptor (err: Error | DataIntegrityError, req: Request, res: Response, next: NextFunction): void {
    if (!(err instanceof DataIntegrityError)) {
        return next(err);
    }
    logger.error(`${err.stack}`);

    if (err.type === DataIntegrityErrorType.PSC_DATA) {
        res.status(HttpStatusCode.InternalServerError);
        const query = req.query || {};
        const companyNumber = typeof query.companyNumber === "string" ? query.companyNumber : "";
        const lang = typeof query.lang === "string" ? query.lang : "";
        res.redirect(addSearchParams(
            getUrlWithStopType(PrefixedUrls.STOP_SCREEN, STOP_TYPE.PROBLEM_WITH_PSC_DATA),
            { companyNumber, lang }
        ));
    } else {
        return next(new Error(`Unhandled DataIntegrityError type: ${err.type}`));
    }
}

import { NextFunction, Request, Response } from "express";
import { logger } from "../../lib/logger";
import { HttpError } from "../../lib/errors/httpError";
import { getViewData } from "../../routers/handlers/generic";
import { getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { njk } from "../../app";
import { HttpStatusCode } from "axios";
import { env } from "../../config";

const TEMPLATE_PATH_ROOT = "error/";
const FALLBACK_TEMPLATE_NAME = "500-internal-server-error";

/**
 * Middleware to handle HTTP errors and render appropriate error templates.
 *
 * This interceptor captures HttpErrors/Errors thrown during request processing and determines
 * the appropriate HTTP status code and error template to render. It supports custom
 * `HttpError` instances and falls back to a generic internal server error for
 * unhandled exceptions.
 *
 * @param error - The error object, which can be an instance of `HttpError` or a generic `Error`.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param _next - The next middleware function in the chain (unused in this interceptor).
 */
export const httpErrorInterceptor = (error: HttpError | Error, req: Request, res: Response, _next: NextFunction) => {
    logger.debug(`Handling error for URL: ${req.url}`);
    if (error instanceof HttpError) {
        logger.raw.error(`${logger.getPrefix({ error })} ${error.status} ${error.stack}`);
        res.status(error.status);
    } else {
        // Treat generic errors as an internal server error
        logger.raw.error(`${logger.getPrefix({ error })} Generic error at URL: ${req.url}. ${error.stack}`);
        res.status(HttpStatusCode.InternalServerError);
    }

    // Determine the template name based on the status code
    let templateName = mapStatusCodeToTemplate(res.statusCode);
    logger.info(`Rendering template: ${templateName} for status code ${res.statusCode}`);

    // Check if the template exists, else fallback to ISE template
    try {
        njk.getTemplate(TEMPLATE_PATH_ROOT + templateName + ".njk");
    } catch (err: any) {
        logger.error(`${err.message}. Falling back to error/${FALLBACK_TEMPLATE_NAME}.njk`);
        templateName = FALLBACK_TEMPLATE_NAME;
    }

    const templatePath = TEMPLATE_PATH_ROOT + templateName;
    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    getViewData(req, res, lang).then((baseViewData) => {
        res.render(templatePath, {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: req.originalUrl,
            extraData: [env.CONTACT_US_LINK]
        });
    });
};

// Convert camel case to status + hyphenated lowercase: NotFound -> 404-not-found
export function mapStatusCodeToTemplate (statusCode: HttpStatusCode): string {
    const statusType = HttpStatusCode[statusCode];

    if (!statusType) {
        logger.error(`Invalid status code: ${statusCode}`);
        return FALLBACK_TEMPLATE_NAME;
    }

    const hyphenatedStatus = statusType
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();
    return `${Number(statusCode)}-${hyphenatedStatus}`;
}

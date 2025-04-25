import { NextFunction, Request, Response } from "express";
import { logger } from "../../lib/logger";
import { HttpError } from "../../lib/errors/httpError";
import { defaultBaseViewData } from "../../routers/handlers/generic";
import { getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";
import { njk } from "../../app";
import { HttpStatusCode } from "axios";
import { env } from "../../config";

const templatePathRoot = "error/";
const fallbackTemplateName = "500-internal-server-error";

// Convert camel case to status + hyphenated lowercase: NotFound -> 404-not-found
export function mapStatusCodeToTemplate (statusCode: HttpStatusCode): string {
    const statusType = HttpStatusCode[statusCode];

    if (!statusType) {
        logger.error(`mapStatusCodeToTemplate - Invalid status code: ${statusCode}`);
        return fallbackTemplateName;
    }

    const hyphenatedStatus = statusType
        .replace(/([a-z])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();
    return `${Number(statusCode)}-${hyphenatedStatus}`;
}

export const httpErrorInterceptor = (err: HttpError | Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
        logger.error(`${err.name} (${err.status}): ${err.stack}`);
        res.status(err.status);
    } else {
        logger.error(`${err.name} Unhandled error at URL: ${req.url}. ${err.stack}`);
        res.status(HttpStatusCode.InternalServerError);
    }

    let templateName = mapStatusCodeToTemplate(res.statusCode);
    logger.info(`httpErrorInterceptor - Rendering template: ${templateName} for status code ${res.statusCode}`);

    // Check if the template exists, else fallback to ISE template
    try {
        njk.getTemplate(templatePathRoot + templateName + ".njk");
    } catch (error) {
        logger.error(`httpErrorInterceptor - Template not found: ${templateName}. Falling back to '${fallbackTemplateName}'. ${error}`);
        templateName = fallbackTemplateName;
    }
    const templatePath = templatePathRoot + templateName;

    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    res.render(templatePath, {
        ...defaultBaseViewData,
        ...getLocaleInfo(locales, lang),
        currentUrl: req.url,
        extraData: [env.CONTACT_US_LINK]
    });
};

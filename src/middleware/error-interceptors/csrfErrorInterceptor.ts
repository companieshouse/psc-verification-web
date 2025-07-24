import { NextFunction, Request, Response } from "express";
import { CsrfError } from "@companieshouse/web-security-node";
import { HttpStatusCode } from "axios";
import { getViewData } from "../../routers/handlers/generic";
import { getLocaleInfo, getLocalesService, selectLang } from "../../utils/localise";

const csrfErrorTemplateName = "error/403-forbidden";

const csrfErrorHandler = (err: CsrfError | Error, req: Request, res: Response, next: NextFunction) => {
    if (!(err instanceof CsrfError)) {
        return next(err);
    }

    const lang = selectLang(req.query.lang);
    const locales = getLocalesService();

    getViewData(req, res, lang).then((baseViewData) => {
        return res.status(HttpStatusCode.Forbidden).render(csrfErrorTemplateName, {
            ...baseViewData,
            ...getLocaleInfo(locales, lang),
            currentUrl: req.originalUrl,
            templateName: csrfErrorTemplateName,
            csrfErrors: true,
            englishOnly: true
        });
    });
};

export default csrfErrorHandler;

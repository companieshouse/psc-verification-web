import { NextFunction, Request, Response } from "express";
import { CsrfError } from "@companieshouse/web-security-node";
import { HttpStatusCode } from "axios";
import { getViewData } from "../../routers/handlers/generic";

const csrfErrorTemplateName = "error/403-forbidden";

const csrfErrorHandler = (err: CsrfError | Error, req: Request, res: Response, next: NextFunction) => {
    if (!(err instanceof CsrfError)) {
        return next(err);
    }

    getViewData(req, res).then((baseViewData) => {
        return res.status(HttpStatusCode.Forbidden).render(csrfErrorTemplateName, {
            ...baseViewData,
            currentUrl: req.originalUrl,
            templateName: csrfErrorTemplateName,
            csrfErrors: true,
            englishOnly: true
        });
    });
};

export default csrfErrorHandler;

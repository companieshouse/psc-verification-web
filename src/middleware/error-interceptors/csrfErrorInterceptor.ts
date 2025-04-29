import { NextFunction, Request, Response } from "express";
import { CsrfError } from "@companieshouse/web-security-node";
import { HttpStatusCode } from "axios";

const csrfErrorTemplateName = "error/403-forbidden";

const csrfErrorHandler = (
    err: CsrfError | Error,
    _: Request,
    res: Response,
    next: NextFunction
) => {
    if (!(err instanceof CsrfError)) {
        return next(err);
    }

    return res.status(HttpStatusCode.Forbidden).render(csrfErrorTemplateName, {
        csrfErrors: true
    });
};

export default csrfErrorHandler;

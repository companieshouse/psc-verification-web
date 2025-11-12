import { NextFunction, Request, Response } from "express";

export const injectGenericViewData = (req: Request, res: Response, next: NextFunction) => {
    if (req.url.endsWith("/healthcheck")) {
        return next();
    }

    res.locals.currentUrl = req.originalUrl;

    next();
};

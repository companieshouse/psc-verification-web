import { AuthOptions, authMiddleware } from "@companieshouse/web-security-node";
import { NextFunction, Request, Response } from "express";
import { env } from "../config";

export const authenticationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: env.CHS_URL,
        returnUrl: req.originalUrl
    };

    return authMiddleware(authMiddlewareConfig)(req, res, next);

};

import { AuthOptions, authMiddleware } from "@companieshouse/web-security-node";
import { NextFunction, Request, Response } from "express";
import { env } from "../config";
import { handleExceptions } from "../utils/asyncHandler";

export const authenticate = handleExceptions(async (req: Request, res: Response, next: NextFunction) => {
    const authMiddlewareConfig: AuthOptions = {
        chsWebUrl: env.CHS_URL,
        returnUrl: req.originalUrl
    };

    const authHandler = authMiddleware(authMiddlewareConfig);
    authHandler(req, res, next);
});

import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

/**
 * Express middleware that generates a unique request ID for each incoming request.
 *
 * The generated UUID is set on the request headers as "x-request-id" and "context",
 * and also added to the response headers as "x-request-id".
 *
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next middleware function
 */
export const requestIdGenerator = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = uuidv4();

    req.headers["x-request-id"] = requestId;
    req.headers.context = requestId;
    res.setHeader("x-request-id", requestId);

    return next();
};

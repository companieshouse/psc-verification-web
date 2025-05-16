import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    // Ignore the healthcheck route
    if (req.url.endsWith("/healthcheck")) {
        return next();
    }

    // Track request start time
    const startTime = process.hrtime();

    // Pre-process log
    logger.debugRequest(req, `${requestLogger.name} - OPEN request ${req.headers["x-request-id"]}: ${req.method} ${req.originalUrl}`);

    // Post-process log
    res.on("finish", () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const durationInMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
        logger.debug(`${requestLogger.name} - CLOSED request ${req.headers["x-request-id"]} after ${durationInMs}ms with status ${res.statusCode}`);
    });

    return next();
};

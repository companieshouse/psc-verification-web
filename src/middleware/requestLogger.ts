import { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";
import { requestIdGenerator } from "./requestIdGenerator";

/**
 * Middleware to log incoming HTTP requests and their corresponding responses.
 *
 * This middleware logs the request details when it starts and logs the response details
 * (including duration and status code) when the response is finished.
 *
 * NOTE: This middleware must appear below the `requestIdGenerator` middleware in the
 * middleware chain to function correctly, as it relies on the `x-request-id` header.
 *
 * @param req - The incoming HTTP request object.
 * @param res - The outgoing HTTP response object.
 * @param next - The next middleware function in the chain.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
    // Ignore the healthcheck route
    if (req.url.endsWith("/healthcheck")) {
        return next();
    }

    // Required due to res.on("finish") being asynchronous
    const logPrefix = logger.getPrefix({ stackPos: 2 });

    // Extract the request ID from the headers; log error & use UNKNOWN if not present
    let requestId = req.headers["x-request-id"];
    if (!requestId) {
        logger.raw.error(`${logPrefix} Request ID is missing. Ensure that the '${requestIdGenerator.name}' middleware is called before this middleware.`);
        requestId = "UNKNOWN";
    }

    // Track request start time
    const startTime = process.hrtime();

    // Pre-process log
    logger.raw.debugRequest(req, `${logPrefix} OPEN request with requestId="${requestId}": ${req.method} ${req.originalUrl}`);

    // Post-process log
    res.on("finish", () => {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        const durationInMs = (seconds * 1000 + nanoseconds / 1e6).toFixed(2);
        logger.raw.debug(`${logPrefix} CLOSED request with requestId="${requestId}" after ${durationInMs}ms with status ${res.statusCode}`);
    });

    return next();
};

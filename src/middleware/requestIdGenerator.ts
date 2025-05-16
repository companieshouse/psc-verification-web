import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

export const requestIdGenerator = (req: Request, res: Response, next: NextFunction): void => {
    const requestId = uuidv4();
    req.headers["x-request-id"] = requestId;
    req.headers.context = requestId;
    next();
};

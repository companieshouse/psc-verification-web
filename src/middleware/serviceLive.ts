import { NextFunction, Request, Response } from "express";
import { env } from "../config";

export const isLive = (req: Request, res: Response, next: NextFunction) => {

    if (env.SERVICE_LIVE !== "true") {
        res.render("router_views/serviceNotLive/service-not-live");
    } else {
        next();
    }
};

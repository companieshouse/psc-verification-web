
import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import InternalServerErrorHandler from "../routers/handlers/error/internalServerErrorHandler";
import { logger } from "../lib/logger";

export const internalServerError = (err: any, req: Request, res: Response, _next: NextFunction) => {
    logger.error(`${err.name} - appError: ${err.message} - ${err.stack}`);

    const handler = new InternalServerErrorHandler();
    handler.executeGet(req, res).then((viewModel) => {
        const { templatePath, viewData } = viewModel;
        res.status(HttpStatusCode.InternalServerError).render(templatePath, viewData);
    });
};

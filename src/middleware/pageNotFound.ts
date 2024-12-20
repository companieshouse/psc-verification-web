
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import PageNotFoundHandler from "../routers/handlers/error/pageNotFoundHandler";

export const pageNotFound = (req: Request, res: Response) => {

    const handler = new PageNotFoundHandler();
    handler.executeGet(req, res).then((viewModel) => {
        const { templatePath, viewData } = viewModel;
        res.status(HttpStatusCode.NotFound).render(templatePath, viewData);
    });
};

import { HttpStatusCode } from "axios";
import { Request, Response, Router } from "express";
import { logger } from "../lib/logger";

const healthCheckRouter: Router = Router();

healthCheckRouter.get("/", (req: Request, res: Response) => {
    logger.debugRequest(req, `GET healthcheck`);

    res.status(HttpStatusCode.Ok).send("OK");
});

export default healthCheckRouter;

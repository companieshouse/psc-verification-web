import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/async.handler";
import logger from "../lib/Logger";
import FullRecordHandler from "./handlers/fullRecord";
import { Session } from "@companieshouse/node-session-handler";
import { PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { PrefixedUrls } from "../constants";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new FullRecordHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

router.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const fullJson: string = req?.body?.fullRecord;
    logger.debug("JSON = " + fullJson);
    const handler = new FullRecordHandler();
    const session: Session = req.session as Session;

    await handler.executePost(session, req, res, fullJson)
        .then((resource) => {
            logger.debug("CREATED: " + resource);
            res.redirect(PrefixedUrls.FULL_RECORD + "/?status=CREATED&statusColour=govuk-tag--green");
        })
        .catch((error) => {
            logger.debug("POST FAILED: " + error.message);
            res.redirect(PrefixedUrls.FULL_RECORD + `/?status=${error.message}&statusColour=govuk-tag--red`);
        });
}));

export default router;

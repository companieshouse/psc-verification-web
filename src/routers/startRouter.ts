import { Request, Response, Router, NextFunction } from "express";
import { StartHandler } from "./handlers/start/start";
import { StartPostHandler } from "./handlers/start/startPostFull";
import { handleExceptions } from "../utils/async.handler";
import { PrefixedUrls } from "../constants";
import { Session } from "@companieshouse/node-session-handler";

const router: Router = Router();

router.get("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {

    const handler = new StartHandler();
    const params = await handler.execute(req, res);

    if (params.templatePath && params.viewData) {
        res.render(params.templatePath, params.viewData);
    }
}));

router.post(PrefixedUrls.START, handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const fullJson: string = req?.body?.fullJson;
    console.log("JSON = " + fullJson);
    const handler = new StartPostHandler();
    const session: Session = req.session as Session;

    await handler.post(session, req, res, fullJson);
}));

export default router;

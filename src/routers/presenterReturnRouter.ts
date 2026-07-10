import { Request, Response, Router } from "express";
import { PresenterReturnHandler } from "./handlers/presenter-return/presenterReturnHandler";

const presenterReturnRouter: Router = Router({ mergeParams: true });

presenterReturnRouter.get("/", (req: Request, res: Response) => {
    const handler = new PresenterReturnHandler();
    handler.execute(req, res);
});

export default presenterReturnRouter;

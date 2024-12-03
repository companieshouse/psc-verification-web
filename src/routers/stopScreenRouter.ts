import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { StopScreenHandler } from "./handlers/stop-screen/stopScreenHandler";

const stopScreenRouter: Router = Router({ mergeParams: true });

stopScreenRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new StopScreenHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default stopScreenRouter;

import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { RleDirectorHandler } from "./handlers/rle-director/rleDirector";

const rleDirectorRouter: Router = Router({ mergeParams: true });

rleDirectorRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new RleDirectorHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default rleDirectorRouter;

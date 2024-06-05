import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { RleDetailsHandler } from "./handlers/rle-details/rleDetails";

const rleDetailsRouter: Router = Router({ mergeParams: true });

rleDetailsRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new RleDetailsHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default rleDetailsRouter;

import { NextFunction, Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";

const errorRouter: Router = Router();

errorRouter.get("/", (req: Request, res: Response, _next: NextFunction) => {
    const status = req.query?.status as string || "500";

    throw new Error(status);
});

errorRouter.get("/async", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const status = req.query?.status as string || "500";
    // pause to show async nature of this route
    await timeout(3000);

    return Promise.reject(new Error(status));
}));

function timeout (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default errorRouter;

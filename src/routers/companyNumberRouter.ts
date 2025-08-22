import { Request, Response, Router } from "express";
import { handleExceptions } from "../utils/asyncHandler";
import { CompanyNumberHandler } from "./handlers/confirm-company/companyNumber";

const companyNumberRouter: Router = Router({ mergeParams: true });

companyNumberRouter.get("/", handleExceptions(async (req: Request, res: Response) => {
    const handler = new CompanyNumberHandler();
    handler.execute(req, res);
}));

export default companyNumberRouter;

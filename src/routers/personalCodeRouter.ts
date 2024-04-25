import { Request, Response, Router } from "express";
import { Urls } from "../constants";
import { authenticate } from "../middleware/authentication";
import { handleExceptions } from "../utils/asyncHandler";
import { PersonalCodeHandler } from "./handlers/personal-code/personalCode";

const router: Router = Router();

router.get(Urls.PERSONAL_CODE, authenticate, handleExceptions(async (req: Request, res: Response) => {
    const handler = new PersonalCodeHandler();
    const { templatePath, viewData } = await handler.executeGet(req, res);
    res.render(templatePath, viewData);
}));

export default router;

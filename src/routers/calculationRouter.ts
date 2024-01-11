import { Request, Response, Router, NextFunction } from "express";
import { SelectNumberHandler } from "./handlers/calculation/selectNumber";
import { NUMBER_RESULT_PATH } from "../types/page.urls";

const router: Router = Router();
const routeViews: string = "router_views/calculation";

router.get("/select-number", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new SelectNumberHandler();
    const viewData = await handler.execute(req, res);

    res.render(`${routeViews}/select-number`, viewData);
});

router.post("/select-number", async (req: Request, res: Response, next: NextFunction) => {

    try {
        const handler = new SelectNumberHandler();
        const viewData = await handler.execute(req, res, "POST");

        console.log("ViewData " + viewData.errors);
        // return res.redirect(NUMBER_RESULT_PATH);

        res.render(`${routeViews}/select-number`, viewData);

    } catch (e) {
        return next(e);
    }
});

router.get("/number-result", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new SelectNumberHandler();
    const viewData = await handler.execute(req, res);

    res.render(`${routeViews}/number-result`, viewData);
});

export default router;

import { Request, Response, Router, NextFunction } from "express";
import { StartHandler } from "./handlers/start/start";

const router: Router = Router();
const routeViews: string = "router_views/start";

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    const handler = new StartHandler();
    const viewData = await handler.execute(req, res);
    res.render(`${routeViews}/start`, viewData);
});

export default router;

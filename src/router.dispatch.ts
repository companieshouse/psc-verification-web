// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response, Router } from "express";
import indexRouter from "./routers/indexRouter";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use("/persons-with-significant-control-verification", router);

    router.use("/", indexRouter);
    router.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;

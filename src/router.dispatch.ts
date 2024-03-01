// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response, Router } from "express";
import startRouter from "./routers/startRouter";
import { StartRouter, SkeletonOneRouter, SkeletonTwoRouter, SkeletonThreeRouter, SkeletonFourRouter, SkeletonFiveRouter, SkeletonSixRouter } from "./routers/__utils";
import { Urls, servicePathPrefix } from "./constants";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use(servicePathPrefix, router);

    router.use("/", StartRouter);
    router.use("/start", StartRouter);
    router.use(Urls.SKELETON_ONE, SkeletonOneRouter);
    router.use(Urls.SKELETON_TWO, SkeletonTwoRouter);
    router.use(Urls.SKELETON_THREE, SkeletonThreeRouter);
    router.use(Urls.SKELETON_FOUR, SkeletonFourRouter);
    router.use(Urls.SKELETON_FIVE, SkeletonFiveRouter);
    router.use(Urls.SKELETON_SIX, SkeletonSixRouter);
    router.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;

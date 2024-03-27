// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response, Router } from "express";
import { StartRouter, CompanyNumberRouter, ConfirmCompanyRouter, PscTypeRouter, IndividualPscListRouter, PersonalCodeRouter, IndividualStatementRouter, PscVerifiedRouter, RlePscListRouter, FullRecordRouter } from "./routers/__utils";
import { Urls, servicePathPrefix } from "./constants";
import { authenticationMiddleware } from "./middleware/authentication";
import { sessionMiddleware } from "./middleware/session";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use(servicePathPrefix, router);

    router.use("/", sessionMiddleware, StartRouter);
    router.use(Urls.START, sessionMiddleware, StartRouter);
    router.use(Urls.COMPANY_NUMBER, authenticationMiddleware, CompanyNumberRouter);
    router.use(Urls.CONFIRM_COMPANY, authenticationMiddleware, ConfirmCompanyRouter);
    router.use(Urls.FULL_RECORD, authenticationMiddleware, FullRecordRouter);
    router.use(Urls.PSC_TYPE, authenticationMiddleware, PscTypeRouter);
    router.use(Urls.INDIVIDUAL_PSC_LIST, authenticationMiddleware, IndividualPscListRouter);
    router.use(Urls.PERSONAL_CODE, authenticationMiddleware, PersonalCodeRouter);
    router.use(Urls.INDIVIDUAL_STATEMENT, authenticationMiddleware, IndividualStatementRouter);
    router.use(Urls.PSC_VERIFIED, authenticationMiddleware, PscVerifiedRouter);
    router.use(Urls.RLE_LIST, authenticationMiddleware, RlePscListRouter);
    router.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;

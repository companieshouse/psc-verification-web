// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response, Router } from "express";
import { Urls, servicePathPrefix } from "./constants";
import { authenticationMiddleware } from "./middleware/authentication";
import { CompanyNumberRouter, ConfirmCompanyRouter, ConfirmRoStatementsRouter, IndividualPscListRouter, IndividualStatementRouter, PersonalCodeRouter, PscTypeRouter, PscVerifiedRouter, RleDetailsRouter, RleDirectorRouter, RlePscListRouter, StartRouter } from "./routers/utils";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use(servicePathPrefix, router);

    router.use("/", StartRouter);
    router.use(Urls.START, StartRouter);
    router.use(Urls.COMPANY_NUMBER, authenticationMiddleware, CompanyNumberRouter);
    router.use(Urls.CONFIRM_COMPANY, authenticationMiddleware, ConfirmCompanyRouter);
    router.use(Urls.PSC_TYPE, authenticationMiddleware, PscTypeRouter);
    router.use(Urls.INDIVIDUAL_PSC_LIST, authenticationMiddleware, IndividualPscListRouter);
    router.use(Urls.PERSONAL_CODE, authenticationMiddleware, PersonalCodeRouter);
    router.use(Urls.INDIVIDUAL_STATEMENT, authenticationMiddleware, IndividualStatementRouter);
    router.use(Urls.PSC_VERIFIED, authenticationMiddleware, PscVerifiedRouter);
    router.use(Urls.RLE_LIST, authenticationMiddleware, RlePscListRouter);
    router.use(Urls.RLE_DETAILS, authenticationMiddleware, RleDetailsRouter);
    router.use(Urls.RLE_DIRECTOR, authenticationMiddleware, RleDirectorRouter);
    router.use(Urls.CONFIRM_RO_STATEMENTS, authenticationMiddleware, ConfirmRoStatementsRouter);

    router.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;

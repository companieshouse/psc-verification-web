// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response, Router } from "express";
import { StartRouter, CompanyNumberRouter, ConfirmCompanyRouter, PscTypeRouter, IndividualPscListRouter, PersonalCodeRouter, IndividualStatementRouter, PscVerifiedRouter, RlePscListRouter, RleDetailsRouter } from "./routers/__utils";
import { Urls, servicePathPrefix } from "./constants";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use(servicePathPrefix, router);

    router.use("/", StartRouter);
    router.use(Urls.START, StartRouter);
    router.use(Urls.COMPANY_NUMBER, CompanyNumberRouter);
    router.use(Urls.CONFIRM_COMPANY, ConfirmCompanyRouter);
    router.use(Urls.PSC_TYPE, PscTypeRouter);
    router.use(Urls.INDIVIDUAL_PSC_LIST, IndividualPscListRouter);
    router.use(Urls.PERSONAL_CODE, PersonalCodeRouter);
    router.use(Urls.INDIVIDUAL_STATEMENT, IndividualStatementRouter);
    router.use(Urls.PSC_VERIFIED, PscVerifiedRouter);
    router.use(Urls.RLE_LIST, RlePscListRouter);
    router.use(Urls.RLE_DETAILS, RleDetailsRouter);
    router.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;

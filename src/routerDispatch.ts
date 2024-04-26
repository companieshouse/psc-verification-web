// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response, Router } from "express";
import { Urls, servicePathPrefix } from "./constants";
import { CompanyNumberRouter, ConfirmCompanyRouter, ConfirmRoStatementsRouter, IndividualPscListRouter, IndividualStatementRouter, NotADirectorRouter, PersonalCodeRouter, PscTypeRouter, PscVerifiedRouter, RleDetailsRouter, RleDirectorRouter, RlePscListRouter, StartRouter } from "./routers/utils";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use(servicePathPrefix, router);

    router.use("/", StartRouter);
    router.use(Urls.START, StartRouter);
    router.use(CompanyNumberRouter);
    router.use(IndividualPscListRouter);
    router.use(PscTypeRouter);
    router.use(ConfirmCompanyRouter);
    router.use(PersonalCodeRouter);
    router.use(IndividualStatementRouter);
    router.use(PscVerifiedRouter);
    router.use(RlePscListRouter);
    router.use(RleDetailsRouter);
    router.use(RleDirectorRouter);
    router.use(ConfirmRoStatementsRouter);
    router.use(NotADirectorRouter);

    router.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;

// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response, Router } from "express";
import { Urls, servicePathPrefix } from "./constants";
import { CompanyNumberRouter, ConfirmCompanyRouter, ConfirmRoStatementsRouter, IndividualPscListRouter, IndividualStatementRouter, NewSubmissionRouter, NotADirectorRouter, PersonalCodeRouter, PscTypeRouter, PscVerifiedRouter, RleDetailsRouter, RleDirectorRouter, RlePscListRouter, RleVerifiedRouter, StartRouter } from "./routers/utils";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use(servicePathPrefix, router);

    router.use("/", StartRouter);
    router.use(Urls.START, StartRouter);
    router.use(CompanyNumberRouter);
    router.use(ConfirmCompanyRouter);
    router.use(NewSubmissionRouter);
    router.use(IndividualPscListRouter);
    router.use(PscTypeRouter);
    router.use(PersonalCodeRouter);
    router.use(IndividualStatementRouter);
    router.use(PscVerifiedRouter);
    router.use(RlePscListRouter);
    router.use(RleDetailsRouter);
    router.use(RleDirectorRouter);
    router.use(ConfirmRoStatementsRouter);
    router.use(NotADirectorRouter);
    router.use(RleVerifiedRouter);

    router.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;

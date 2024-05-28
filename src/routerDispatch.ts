// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Request, Response, Router } from "express";
import { Urls, servicePathPrefix } from "./constants";
import { CompanyNumberRouter, ConfirmCompanyRouter, ConfirmRoStatementsRouter, IndividualPscListRouter, IndividualStatementRouter, NotADirectorRouter, PersonalCodeRouter, PscTypeRouter, PscVerifiedRouter, RleDetailsRouter, RleDirectorRouter, RlePscListRouter, RleVerifiedRouter, StartRouter } from "./routers/utils";
import { authenticate } from "./middleware/authentication";
import { fetchVerification } from "./middleware/fetchVerification";
import { fetchCompany } from "./middleware/fetchCompany";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use(servicePathPrefix, router);

    router.use("/", StartRouter);
    router.use(Urls.START, StartRouter);
    router.use(Urls.COMPANY_NUMBER, authenticate, CompanyNumberRouter);
    router.use(Urls.CONFIRM_COMPANY, authenticate, ConfirmCompanyRouter);
    router.use(Urls.PSC_TYPE, authenticate, PscTypeRouter);
    router.use(Urls.INDIVIDUAL_PSC_LIST, authenticate, fetchVerification, fetchCompany, IndividualPscListRouter);
    router.use(Urls.PERSONAL_CODE, authenticate, fetchVerification, PersonalCodeRouter);
    router.use(Urls.INDIVIDUAL_STATEMENT, authenticate, fetchVerification, IndividualStatementRouter);
    router.use(Urls.PSC_VERIFIED, authenticate, PscVerifiedRouter);
    router.use(Urls.RLE_LIST, authenticate, RlePscListRouter);
    router.use(Urls.RLE_DETAILS, authenticate, RleDetailsRouter);
    router.use(Urls.RLE_DIRECTOR, authenticate, RleDirectorRouter);
    router.use(Urls.CONFIRM_RO_STATEMENTS, authenticate, ConfirmRoStatementsRouter);
    router.use(Urls.NOT_A_DIRECTOR, authenticate, NotADirectorRouter);
    router.use(Urls.RLE_VERIFIED, authenticate, RleVerifiedRouter);

    router.use("*", (req: Request, res: Response) => {
        res.status(404).render("partials/error_400");
    });
};

export default routerDispatch;

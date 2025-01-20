// Do Router dispatch here, i.e. map incoming routes to appropriate router
import { Application, Router } from "express";
import { Urls, servicePathPrefix } from "./constants";
import { CompanyNumberRouter, ConfirmCompanyRouter, HealthCheckRouter, IndividualPscListRouter, IndividualStatementRouter, NameMismatchRouter, NewSubmissionRouter, PersonalCodeRouter, PscVerifiedRouter, StartRouter, StopScreenRouter } from "./routers/utils";
import { authenticate } from "./middleware/authentication";
import { fetchVerification } from "./middleware/fetchVerification";
import { fetchCompany } from "./middleware/fetchCompany";
import { serviceUnavailable } from "./middleware/serviceUnavailable";
import { checkCompany } from "./middleware/checkCompany";

const routerDispatch = (app: Application) => {

    const router = Router();
    // Required for endpoint prefix
    app.use(servicePathPrefix, router);
    router.use(Urls.START, serviceUnavailable, StartRouter);
    router.use(Urls.HEALTHCHECK, HealthCheckRouter);
    router.use(Urls.COMPANY_NUMBER, authenticate, CompanyNumberRouter);
    router.use(Urls.CONFIRM_COMPANY, authenticate, ConfirmCompanyRouter);
    router.use(Urls.INDIVIDUAL_PSC_LIST, authenticate, fetchCompany, checkCompany, IndividualPscListRouter);
    router.use(Urls.NEW_SUBMISSION, authenticate, NewSubmissionRouter);
    router.use(Urls.PERSONAL_CODE, authenticate, fetchVerification, PersonalCodeRouter);
    router.use(Urls.NAME_MISMATCH, authenticate, fetchVerification, NameMismatchRouter);
    router.use(Urls.INDIVIDUAL_STATEMENT, authenticate, fetchVerification, IndividualStatementRouter);
    router.use(Urls.PSC_VERIFIED, authenticate, fetchVerification, fetchCompany, PscVerifiedRouter);
    router.use(Urls.STOP_SCREEN, authenticate, fetchCompany, StopScreenRouter);
    router.use(Urls.STOP_SCREEN_SUBMISSION, authenticate, StopScreenRouter);
    // this route placed last so only used as a fallback
    router.use("/", serviceUnavailable, StartRouter);
};

export default routerDispatch;

import mockAuthenticationMiddleware from "./authenticationMiddleware.mock";
import mockCsrfProtectionMiddleware from "./csrfProtectionMiddleware.mock";
import mockFetchCompanyMiddleware from "./fetchCompany.mock";
import mockFetchVerificationMiddleware from "./fetchVerification.mock";
import mockSessionMiddleware from "./sessionMiddleware.mock";
import mockServiceUnavailableMiddleware from "./serviceUnavailable.mock";

export default {
    mockSessionMiddleware,
    mockCsrfProtectionMiddleware,
    mockAuthenticationMiddleware,
    mockFetchVerificationMiddleware,
    mockFetchCompanyMiddleware,
    mockServiceUnavailableMiddleware
};

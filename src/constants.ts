
import { env } from "./config";

export const servicePathPrefix = "/persons-with-significant-control-verification";

export const Urls = {
    ACCESSIBILITY_STATEMENT: "/persons-with-significant-control-verification",
    CREATE_TRANSACTION: "/transaction",
    START: "/start",
    COMPANY_NUMBER: "/company-number",
    CONFIRM_COMPANY: "/confirm-company",
    PSC_TYPE: "/psc-type",
    INDIVIDUAL_PSC_LIST: "/individual/psc-list",
    PERSONAL_CODE: "/individual/personal-code",
    INDIVIDUAL_STATEMENT: "/individual/statement",
    PSC_VERIFIED: "/psc-verified",
    HEALTHCHECK: "/healthcheck"
} as const;

export const PrefixedUrls = {
    ACCESSIBILITY_STATEMENT: servicePathPrefix + Urls.ACCESSIBILITY_STATEMENT,
    CREATE_TRANSACTION: servicePathPrefix + Urls.CREATE_TRANSACTION,
    START: servicePathPrefix + Urls.START,
    HEALTHCHECK: servicePathPrefix + Urls.HEALTHCHECK,
    COMPANY_NUMBER: servicePathPrefix + Urls.COMPANY_NUMBER,
    CONFIRM_COMPANY: servicePathPrefix + Urls.CONFIRM_COMPANY,
    INDIVIDUAL_PSC_LIST: servicePathPrefix + Urls.INDIVIDUAL_PSC_LIST,
    PSC_TYPE: servicePathPrefix + Urls.PSC_TYPE,
    PERSONAL_CODE: servicePathPrefix + Urls.PERSONAL_CODE,
    INDIVIDUAL_STATEMENT: servicePathPrefix + Urls.INDIVIDUAL_STATEMENT,
    PSC_VERIFIED: servicePathPrefix + Urls.PSC_VERIFIED,
    COOKIES: "/help/cookies"
} as const;

export const ExternalUrls = {
    COMPANY_LOOKUP: "/company-lookup/search?forward=" + servicePathPrefix + "/confirm-company?companyNumber={companyNumber}",
    COMPANY_LOOKUP_WITH_LANG: "/company-lookup/search?forward=" + servicePathPrefix + "/confirm-company?companyNumber={companyNumber}%26lang="
//     ABILITY_NET: env.ABILITY_NET_LINK,
//     CONTACT_US: env.CONTACT_US_LINK,
//     DEVELOPERS: env.DEVELOPERS_LINK,
//     FEEDBACK: env.FEEDBACK_URL,
//     OPEN_GOVERNMENT_LICENSE: env.OPEN_GOVERNMENT_LICENSE_LINK,
//     POLICIES: env.POLICIES_LINK,
} as const;

//  For use by Matomo
export const Ids = {
    BUTTON_ID_INDIVIDUAL_STATEMENT: "continue_button_ind_statement"
} as const;

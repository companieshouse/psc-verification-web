
import { env } from "./config";

export const servicePathPrefix = "/persons-with-significant-control-verification";

export const Urls = {
    ACCESSIBILITY_STATEMENT: "/persons-with-significant-control-verification",
    START: "/start",
    COMPANY_NUMBER: "/company-number",
    CONFIRM_COMPANY: "/confirm-company",
    FULL_RECORD: "/full-record", // temp. path to spike's data input screen
    PSC_TYPE: "/psc-type",
    INDIVIDUAL_PSC_LIST: "/individual/psc-list",
    PERSONAL_CODE: "/individual/personal-code",
    INDIVIDUAL_STATEMENT: "/individual/psc-statement",
    PSC_VERIFIED: "/psc-verified",
    HEALTHCHECK: "/healthcheck",
    RLE_LIST: "/rle/rle-list"
} as const;

export const PrefixedUrls = {
    ACCESSIBILITY_STATEMENT: servicePathPrefix + Urls.ACCESSIBILITY_STATEMENT,
    START: servicePathPrefix + Urls.START,
    HEALTHCHECK: servicePathPrefix + Urls.HEALTHCHECK,
    COMPANY_NUMBER: servicePathPrefix + Urls.COMPANY_NUMBER,
    CONFIRM_COMPANY: servicePathPrefix + Urls.CONFIRM_COMPANY,
    INDIVIDUAL_PSC_LIST: servicePathPrefix + Urls.INDIVIDUAL_PSC_LIST,
    FULL_RECORD: servicePathPrefix + Urls.FULL_RECORD, // temp. path to spike's data input screen
    PSC_TYPE: servicePathPrefix + Urls.PSC_TYPE,
    PERSONAL_CODE: servicePathPrefix + Urls.PERSONAL_CODE,
    INDIVIDUAL_STATEMENT: servicePathPrefix + Urls.INDIVIDUAL_STATEMENT,
    PSC_VERIFIED: servicePathPrefix + Urls.PSC_VERIFIED,
    RLE_LIST: servicePathPrefix + Urls.RLE_LIST,
    COOKIES: "/help/cookies"
} as const;

export const ExternalUrls = {
    COMPANY_LOOKUP: "/company-lookup/search?forward=" + servicePathPrefix + "/confirm-company?companyNumber={companyNumber}",
    COMPANY_LOOKUP_WITH_LANG: "/company-lookup/search?forward=" + servicePathPrefix + "/confirm-company?companyNumber={companyNumber}%26lang=",
    SIGNOUT: "/signout"
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

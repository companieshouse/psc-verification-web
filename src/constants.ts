
import { env } from "./config";

export const servicePathPrefix = "/persons-with-significant-control-verification";

export const Urls = {
    ACCESSIBILITY_STATEMENT: "/persons-with-significant-control-verification",
    START: "/start",
    COMPANY_NUMBER: "/company-number",
    CONFIRM_COMPANY: "/confirm-company",
    PSC_TYPE: "/psc-type",
    INDIVIDUAL_PSC_LIST: "/individual/psc-list",
    PERSONAL_CODE: "/individual/personal-code",
    INDIVIDUAL_STATEMENT: "/individual/psc-statement",
    PSC_VERIFIED: "/psc-verified",
    HEALTHCHECK: "/healthcheck",
    RLE_LIST: "/rle/rle-list",
    RLE_DETAILS: "/rle/ro-details"
} as const;

export const PrefixedUrls = {
    ACCESSIBILITY_STATEMENT: servicePathPrefix + Urls.ACCESSIBILITY_STATEMENT,
    START: servicePathPrefix + Urls.START,
    HEALTHCHECK: servicePathPrefix + Urls.HEALTHCHECK,
    COMPANY_NUMBER: servicePathPrefix + Urls.COMPANY_NUMBER,
    CONFIRM_COMPANY: servicePathPrefix + Urls.CONFIRM_COMPANY,
    INDIVIDUAL_PSC_LIST: servicePathPrefix + Urls.INDIVIDUAL_PSC_LIST,
    PSC_TYPE: servicePathPrefix + Urls.PSC_TYPE,
    PERSONAL_CODE: servicePathPrefix + Urls.PERSONAL_CODE,
    INDIVIDUAL_STATEMENT: servicePathPrefix + Urls.INDIVIDUAL_STATEMENT,
    PSC_VERIFIED: servicePathPrefix + Urls.PSC_VERIFIED,
    RLE_LIST: servicePathPrefix + Urls.RLE_LIST,
    RLE_DETAILS: servicePathPrefix + Urls.RLE_DETAILS,
    COOKIES: "/help/cookies"
} as const;

export const ExternalUrls = {
    COMPANY_LOOKUP: "/company-lookup/search",
    COMPANY_LOOKUP_FORWARD: servicePathPrefix + "/confirm-company",
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

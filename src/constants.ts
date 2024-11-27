export const servicePathPrefix = "/persons-with-significant-control-verification";
const urlWithTransactionIdAndSubmissionId = "/transaction/:transactionId/submission/:submissionId";

export const Urls = {
    ACCESSIBILITY_STATEMENT: "/persons-with-significant-control-verification",
    HEALTHCHECK: "/healthcheck",
    START: "/start",
    COMPANY_NUMBER: "/company-number",
    CONFIRM_COMPANY: "/confirm-company",
    INDIVIDUAL_PSC_LIST: "/individual/psc-list",
    NEW_SUBMISSION: "/new-submission",
    PERSONAL_CODE: `${urlWithTransactionIdAndSubmissionId}/individual/personal-code`,
    INDIVIDUAL_STATEMENT: `${urlWithTransactionIdAndSubmissionId}/individual/psc-statement`,
    PSC_VERIFIED: `${urlWithTransactionIdAndSubmissionId}/psc-verified`,
    PSC_TYPE: `${urlWithTransactionIdAndSubmissionId}/psc-type`,
    RLE_LIST: `${urlWithTransactionIdAndSubmissionId}/rle/rle-list`
} as const;

export const PrefixedUrls = {
    ACCESSIBILITY_STATEMENT: servicePathPrefix + Urls.ACCESSIBILITY_STATEMENT,
    START: servicePathPrefix + Urls.START,
    HEALTHCHECK: servicePathPrefix + Urls.HEALTHCHECK,
    COMPANY_NUMBER: servicePathPrefix + Urls.COMPANY_NUMBER,
    CONFIRM_COMPANY: servicePathPrefix + Urls.CONFIRM_COMPANY,
    INDIVIDUAL_PSC_LIST: servicePathPrefix + Urls.INDIVIDUAL_PSC_LIST,
    NEW_SUBMISSION: servicePathPrefix + Urls.NEW_SUBMISSION,
    PERSONAL_CODE: servicePathPrefix + Urls.PERSONAL_CODE,
    INDIVIDUAL_STATEMENT: servicePathPrefix + Urls.INDIVIDUAL_STATEMENT,
    PSC_VERIFIED: servicePathPrefix + Urls.PSC_VERIFIED,
    RLE_LIST: servicePathPrefix + Urls.RLE_LIST,
    PSC_TYPE: servicePathPrefix + Urls.PSC_TYPE,
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

// used as Session keys (Redis)
export const SessionKeys = {
    COMPANY_NUMBER: "companyNumber"
} as const;

//  For use by Matomo
export const Ids = {
    BUTTON_ID_INDIVIDUAL_STATEMENT: "continue_button_ind_statement"
} as const;

export const servicePathPrefix = "/persons-with-significant-control-verification";
const urlWithTransactionIdAndSubmissionId = "/transaction/:transactionId/submission/:submissionId";

export const Urls = {
    ACCESSIBILITY_STATEMENT: "/persons-with-significant-control-verification",
    HEALTHCHECK: "/healthcheck",
    START: "/start",
    COMPANY_NUMBER: "/company-number",
    CONFIRM_COMPANY: "/confirm-company",
    NEW_SUBMISSION: "/new-submission",
    PSC_TYPE: `${urlWithTransactionIdAndSubmissionId}/psc-type`,
    INDIVIDUAL_PSC_LIST: `${urlWithTransactionIdAndSubmissionId}/individual/psc-list`,
    PERSONAL_CODE: `${urlWithTransactionIdAndSubmissionId}/individual/personal-code`,
    INDIVIDUAL_STATEMENT: `${urlWithTransactionIdAndSubmissionId}/individual/psc-statement`,
    PSC_VERIFIED: `${urlWithTransactionIdAndSubmissionId}/psc-verified`,
    RLE_LIST: `${urlWithTransactionIdAndSubmissionId}/rle/rle-list`,
    RLE_DETAILS: "/rle/ro-details",
    RLE_DIRECTOR: "/rle/ro-director",
    CONFIRM_RO_STATEMENTS: "/rle/ro-statements",
    NOT_A_DIRECTOR: "/rle/not-director-stop",
    RLE_VERIFIED: "/rle/rle-verified"
} as const;

export const PrefixedUrls = {
    ACCESSIBILITY_STATEMENT: servicePathPrefix + Urls.ACCESSIBILITY_STATEMENT,
    START: servicePathPrefix + Urls.START,
    HEALTHCHECK: servicePathPrefix + Urls.HEALTHCHECK,
    COMPANY_NUMBER: servicePathPrefix + Urls.COMPANY_NUMBER,
    CONFIRM_COMPANY: servicePathPrefix + Urls.CONFIRM_COMPANY,
    NEW_SUBMISSION: servicePathPrefix + Urls.NEW_SUBMISSION,
    INDIVIDUAL_PSC_LIST: servicePathPrefix + Urls.INDIVIDUAL_PSC_LIST,
    PSC_TYPE: servicePathPrefix + Urls.PSC_TYPE,
    PERSONAL_CODE: servicePathPrefix + Urls.PERSONAL_CODE,
    INDIVIDUAL_STATEMENT: servicePathPrefix + Urls.INDIVIDUAL_STATEMENT,
    PSC_VERIFIED: servicePathPrefix + Urls.PSC_VERIFIED,
    RLE_LIST: servicePathPrefix + Urls.RLE_LIST,
    RLE_DETAILS: servicePathPrefix + Urls.RLE_DETAILS,
    RLE_DIRECTOR: servicePathPrefix + Urls.RLE_DIRECTOR,
    CONFIRM_RO_STATEMENTS: servicePathPrefix + Urls.CONFIRM_RO_STATEMENTS,
    NOT_A_DIRECTOR: servicePathPrefix + Urls.NOT_A_DIRECTOR,
    RLE_VERIFIED: servicePathPrefix + Urls.RLE_VERIFIED,
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

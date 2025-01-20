export const servicePathPrefix = "/persons-with-significant-control-verification";
const urlWithTransactionIdAndSubmissionId = "/transaction/:transactionId/submission/:submissionId";

export enum STOP_TYPE {
    COMPANY_STATUS = "company-status",
    COMPANY_TYPE = "company-type",
    PSC_DOB_MISMATCH = "psc-dob-mismatch",
    RP01_GUIDANCE = "rp01-guidance",
    SUPER_SECURE = "super-secure"
};

export enum PSC_KIND_TYPE {
    INDIVIDUAL = "individual-person-with-significant-control",
    SUPER_SECURE = "super-secure-person-with-significant-control"
}

export function toStopScreenUrl (stopType: STOP_TYPE) {
    switch (stopType) {
        case STOP_TYPE.PSC_DOB_MISMATCH:
        case STOP_TYPE.RP01_GUIDANCE:
            return Urls.STOP_SCREEN_SUBMISSION;
        default:
            return Urls.STOP_SCREEN;
    }
}

export function toStopScreenPrefixedUrl (stopType: STOP_TYPE) {
    switch (stopType) {
        case STOP_TYPE.PSC_DOB_MISMATCH:
        case STOP_TYPE.RP01_GUIDANCE:
            return PrefixedUrls.STOP_SCREEN_SUBMISSION;
        default:
            return PrefixedUrls.STOP_SCREEN;
    }
}

export const Urls = {
    ACCESSIBILITY_STATEMENT: "/persons-with-significant-control-verification",
    HEALTHCHECK: "/healthcheck",
    START: "/start",
    COMPANY_NUMBER: "/company-number",
    CONFIRM_COMPANY: "/confirm-company",
    INDIVIDUAL_PSC_LIST: "/individual/psc-list",
    NEW_SUBMISSION: "/new-submission",
    PERSONAL_CODE: `${urlWithTransactionIdAndSubmissionId}/individual/personal-code`,
    NAME_MISMATCH: `${urlWithTransactionIdAndSubmissionId}/individual/psc-why-this-name`,
    INDIVIDUAL_STATEMENT: `${urlWithTransactionIdAndSubmissionId}/individual/psc-statement`,
    INTERNAL_SERVER_ERROR: "/internal-server-error",
    PAGE_NOT_FOUND: "/page-not-found",
    SERVICE_UNAVAILABLE: "/service-unavailable",
    PSC_VERIFIED: `${urlWithTransactionIdAndSubmissionId}/psc-verified`,
    STOP_SCREEN: "/stop/:stopType",
    STOP_SCREEN_SUBMISSION: `${urlWithTransactionIdAndSubmissionId}/stop/:stopType`
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
    NAME_MISMATCH: servicePathPrefix + Urls.NAME_MISMATCH,
    INDIVIDUAL_STATEMENT: servicePathPrefix + Urls.INDIVIDUAL_STATEMENT,
    SERVICE_UNAVAILABLE: servicePathPrefix + Urls.SERVICE_UNAVAILABLE,
    PSC_VERIFIED: servicePathPrefix + Urls.PSC_VERIFIED,
    STOP_SCREEN: servicePathPrefix + Urls.STOP_SCREEN,
    STOP_SCREEN_SUBMISSION: servicePathPrefix + Urls.STOP_SCREEN_SUBMISSION,
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

// Matomo event IDs that occur more than once accross templates
export const CommonDataEventIds = {
    CONTINUE_BUTTON: "continue-button"
} as const;

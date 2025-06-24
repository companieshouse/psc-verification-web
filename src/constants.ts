export const servicePathPrefix = "/persons-with-significant-control-verification";
export const urlWithTransactionIdAndSubmissionId = "/transaction/:transactionId/submission/:submissionId";

export enum STOP_TYPE {
    COMPANY_STATUS = "company-status",
    COMPANY_TYPE = "company-type",
    EMPTY_PSC_LIST = "empty-psc-list",
    PSC_DOB_MISMATCH = "psc-dob-mismatch",
    SUPER_SECURE = "super-secure",
    PROBLEM_WITH_PSC_DATA = "problem-with-psc-data"
}

export enum PSC_KIND_TYPE {
    INDIVIDUAL = "individual-person-with-significant-control",
    SUPER_SECURE = "super-secure-person-with-significant-control"
}

export function toStopScreenUrl (stopType: STOP_TYPE) {
    if (stopType === STOP_TYPE.PSC_DOB_MISMATCH) {
        return Urls.STOP_SCREEN_SUBMISSION;
    } else {
        return Urls.STOP_SCREEN;
    }
}

export function toStopScreenPrefixedUrl (stopType: STOP_TYPE) {
    if (stopType === STOP_TYPE.PSC_DOB_MISMATCH) {
        return PrefixedUrls.STOP_SCREEN_SUBMISSION;
    } else {
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
} as const;

// used as Session keys (Redis)
export const SessionKeys = {
    COMPANY_NUMBER: "companyNumber"
} as const;

// Matomo event IDs that occur more than once across templates
export const CommonDataEventIds = {
    CONTACT_US_LINK: "contact-us-link",
    CONTINUE_BUTTON: "continue-button",
    GO_BACK_AND_RETRY_LINK: "go-back-and-retry-link"
} as const;

// Used for api error responses
export const Responses = {
    PROBLEM_WITH_PSC_DATA: "We are currently unable to process a Verification filing for this PSC"
} as const;

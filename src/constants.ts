
import { env } from "./config";

export const servicePathPrefix = "/persons-with-significant-control-verification";

export const Urls = {
    ACCESSIBILITY_STATEMENT: "/persons-with-significant-control-verification",
    START: "/start",
    SKELETON_ONE: "/skeleton_one",
    PSC_TYPE: "/psc_type",
    SKELETON_THREE: "/skeleton_three",
    SKELETON_FOUR: "/skeleton_four",
    SKELETON_FIVE: "/skeleton_five",
    SKELETON_SIX: "/skeleton_six",
    HEALTHCHECK: "/healthcheck"
} as const;

export const PrefixedUrls = {
    ACCESSIBILITY_STATEMENT: servicePathPrefix + Urls.ACCESSIBILITY_STATEMENT,
    START: servicePathPrefix + Urls.START,
    HEALTHCHECK: servicePathPrefix + Urls.HEALTHCHECK,
    SKELETON_ONE: servicePathPrefix + Urls.SKELETON_ONE,
    PSC_TYPE: servicePathPrefix + Urls.PSC_TYPE,
    SKELETON_THREE: servicePathPrefix + Urls.SKELETON_THREE,
    SKELETON_FOUR: servicePathPrefix + Urls.SKELETON_FOUR,
    SKELETON_FIVE: servicePathPrefix + Urls.SKELETON_FIVE,
    SKELETON_SIX: servicePathPrefix + Urls.SKELETON_SIX,
    COOKIES: "/help/cookies"
} as const;

export const ExternalUrls = {
//     ABILITY_NET: env.ABILITY_NET_LINK,
//     CONTACT_US: env.CONTACT_US_LINK,
//     DEVELOPERS: env.DEVELOPERS_LINK,
//     FEEDBACK: env.FEEDBACK_URL,
//     OPEN_GOVERNMENT_LICENSE: env.OPEN_GOVERNMENT_LICENSE_LINK,
//     POLICIES: env.POLICIES_LINK,
} as const;

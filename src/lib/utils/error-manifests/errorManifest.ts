import { getLocalesService } from "../../../utils/localise";

const localesService = getLocalesService();

const errorManifest = (lang: string = "en", attribute: string = "") => ({
    generic: {
        serverError: {
            summary: localesService.i18nCh.resolveSingleKey("server_error_summary", lang)
        }
    },

    validation: {
        default: {
            summary: localesService.i18nCh.resolveSingleKey("validation_error_summary", lang),
            inline: localesService.i18nCh.resolveSingleKey("validation_error_inline", lang)
        },
        pscType: {
            blank: {
                summary: localesService.i18nCh.resolveSingleKey("psc_type_error_summary", lang),
                inline: localesService.i18nCh.resolveSingleKey("psc_type_error_inline", lang)
            },
            incorrect: {}
        },
        pscVerificationStatus: {
            blank: {
                summary: "Select the PSC you're providing verification details for",
                inline: "Select the PSC you're providing verification details for"
            },
            incorrect: {}
        },
        relevantOfficerConfirmation: {
            blank: {
                summary: "Confirm if the relevant officer is a director of the relevant legal entity, or someone whose roles and responsibilities correspond to that of a company director.",
                inline: "Confirm if the relevant officer is a director of the relevant legal entity, or someone whose roles and responsibilities correspond to that of a company director."
            },
            incorrect: {}
        },
        personalCode: {
            blank: {
                summary: (localesService.i18nCh.resolveSingleKey("personal_code_error_summary", lang) + attribute),
                inline: (localesService.i18nCh.resolveSingleKey("personal_code_error_inline", lang) + attribute)
            },
            incorrect: {}
        },
        pscIdentityVerificationStatement: {
            blank: {
                summary: "Confirm if the identity verification statement is correct",
                inline: "Confirm if the identity verification statement is correct"
            },
            incorrect: {}
        }
    }
});

export default errorManifest;

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

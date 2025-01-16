import { getLocalesService } from "../../../utils/localise";

const localesService = getLocalesService();

const errorManifest = (lang: string = "en") => ({
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
                summary: localesService.i18nCh.resolveSingleKey("personal_code_error_summary", lang),
                inline: localesService.i18nCh.resolveSingleKey("personal_code_error_inline", lang)
            },
            incorrect: {}
        },
        nameMismatch: {
            blank: {
                summary: (localesService.i18nCh.resolveSingleKey("name_mismatch_error_summary", lang)),
                inline: (localesService.i18nCh.resolveSingleKey("name_mismatch_error_inline", lang))
            },
            incorrect: {}
        },
        individualStatement: {
            blank: {
                summary: localesService.i18nCh.resolveSingleKey("individual_statement_error_summary", lang),
                inline: localesService.i18nCh.resolveSingleKey("individual_statement__error_inline", lang)
            },
            incorrect: {}
        }
    }
});

export default errorManifest;

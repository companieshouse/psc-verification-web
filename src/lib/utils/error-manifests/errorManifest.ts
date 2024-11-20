import { getLocalesService } from "../../../utils/localise";

const localesService = getLocalesService();

const errorManifest = (lang: string = "en") => ({
    generic: {
        serverError: {
            summary: localesService.i18nCh.resolveSingleKey("server_error_summary", lang) || "There was an error processing your request. Please try again."
        }
    },

    validation: {
        default: {
            summary: localesService.i18nCh.resolveSingleKey("validation_error_summary", lang) || "Your request contains validation errors",
            inline: localesService.i18nCh.resolveSingleKey("validation_error_inline", lang) || "Your request contains validation errors"
        },
        firstName: {
            blank: {
                summary: "Enter the first name",
                inline: "Enter the first name"
            },
            incorrect: {
                summary: "Enter a valid firstname",
                inline: "Enter a valid firstname"
            }
        },
        middleName: {
            blank: {},
            incorrect: {
                summary: "Enter a valid middle name",
                inline: "Enter a valid middle name"
            }
        },
        lastName: {
            blank: {
                summary: "Enter the last name",
                inline: "Enter the last name"
            },
            incorrect: {
                summary: "Enter a valid last name",
                inline: "Enter a valid last name"
            }
        },
        dateOfBirth: {
            blank: {
                summary: "Enter the date of birth",
                inline: "Enter the date of birth"
            },
            incorrect: {
                summary: "Enter a valid date of birth",
                inline: "Enter a valid  date of birth"
            }
        },
        pscType: {
            blank: {
                summary: localesService.i18nCh.resolveSingleKey("psc_type_error_summary", lang) || "Select if you're providing verification details for a PSC or RLE",
                inline: localesService.i18nCh.resolveSingleKey("psc_type_error_inline", lang) || "Inline: Select if you're providing verification details for a PSC or RLE"
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
        relevantOfficerPersonalCode: {
            blank: {
                summary: "Enter the personal code for the relevant officer",
                inline: "Enter the personal code for the relevant officer"
            },
            incorrect: {
                summary: "Enter a valid personal code for the relevant officer",
                inline: "Enter a valid personal code for the relevant officer"
            }
        },
        pscPersonalCode: {
            blank: {
                summary: "Enter the personal code for the PSC",
                inline: "Enter the personal code for the PSC"
            },
            incorrect: {
                summary: "Enter a valid personal code for the PSC",
                inline: "Enter a valid personal code for the PSC"
            }
        },
        pscIdentityVerificationStatement: {
            blank: {
                summary: "Confirm if the identity verification statement is correct",
                inline: "Confirm if the identity verification statement is correct"
            },
            incorrect: {}
        },
        relevantOfficerStatementConfirmation: {
            blank: {
                summary: "Summary error text for relevantOfficerStatementConfirmation to be provided",
                inline: "Inline error text for relevantOfficerStatementConfirmation to be provided"
            },
            incorrect: {}
        }
    }
});

export default errorManifest;

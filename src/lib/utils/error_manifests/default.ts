const errorManifest = {
    generic: {
        serverError: {
            summary: "There was an error processing your request. Please try again."
        }
    },
    validation: {
        default: {
            summary: "Your request contains validation errors",
            inline: "Your request contains validation errors"
        },
        chosenNumber: {
            blank: {
                summary: "Enter a number",
                inline: "Enter a number"
            },
            incorrect: {
                summary: "Chosen number is not valid",
                inline: "Enter a valid number between 1 and 100"
            }
        }
    }
};

export default errorManifest;

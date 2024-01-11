import logger from "./../../Logger";
import { GenericValidator } from "./../../validation/generic";

export class NumberFormsValidator extends GenericValidator {

    constructor (classParam?: string) {
        super();
    }

    validateChosenNumber (payload: any): Promise<any> {
        logger.info("Request to validate chosen number payload");
        console.log(payload);
        try {
            if (typeof payload.chosenNumber !== "undefined" && !payload.chosenNumber.length) {
                logger.info("undef");
                console.log(this.errorManifest.validation.chosenNumber.blank);
                this.errors.stack.chosenNumber = this.errorManifest.validation.chosenNumber.blank;
            } else if (!this.isValidNumber(payload.chosenNumber)) {
                logger.info("incorrect");
                this.errors.stack.chosenNumber = this.errorManifest.validation.chosenNumber.incorrect;
            }

            // validate additional fields in payload here, adding to error object as and when validation fails

            // finally, check if all fields validated correctly, or if one or more of them failed
            if (!Object.keys(this.errors.stack).length) {
                return Promise.resolve(true);
            } else {
                logger.info("reject");
                return Promise.reject(this.errors);
            }
        } catch (err) {
            logger.info("err");
            this.errors.stack = this.errorManifest.generic.serverError;
            return Promise.reject(this.errors);
        }
    }

    validateSaveDetails (payload: any): Promise<any> {
        return Promise.resolve(true);
    }
};

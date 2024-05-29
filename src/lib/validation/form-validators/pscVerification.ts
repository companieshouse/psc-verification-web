import { logger } from "./../../logger";
import { GenericValidator } from "./../../validation/generic";

export class PscVerificationFormsValidator extends GenericValidator {

    constructor (classParam?: string) {
        super();
    }

    validatePscType (payload: any): Promise<Object> {
        logger.info(`Request to validate PSC-Type form`);
        try {
            if (typeof payload.pscType === "undefined" || !this.isValidPscType(payload.pscType)) {
                this.errors.stack.pscType = this.errorManifest.validation.pscType.blank;
            }

            // validate additional form fields here

            if (!Object.keys(this.errors.stack).length) {
                return Promise.resolve(this.errors.stack);
            } else {
                return Promise.reject(this.errors);
            }
        } catch (err) {
            this.errors.serverError = this.errorManifest.generic.serverError;
            return Promise.reject(this.errors);
        }
    }

    validateRleVerificationStatus (payload: any): Promise<any> {
        return Promise.resolve(true);
    }

    validateRelevantOfficerDetails (payload: any): Promise<any> {
        return Promise.resolve(true);
    }

    validateRelevantOfficerConfirmationStatements (payload: any): Promise<any> {
        return Promise.resolve(true);
    }
};

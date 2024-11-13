import { logger } from "./../../logger";
import { GenericValidator } from "./../../validation/generic";
import errorManifest from "../../utils/error-manifests/errorManifest";

export class PscVerificationFormsValidator extends GenericValidator {

    constructor (lang: string = "en") {
        super();
        this.lang = lang;
    }

    validatePscType (payload: any, _lang: string): Promise<Object> {
        logger.info(`Request to validate PSC-Type form`);
        this.errorManifest = errorManifest(this.lang);

        try {
            if (typeof payload.pscType === "undefined" || !this.isValidPscType(payload.pscType)) {
                this.errors.stack.pscType = this.errorManifest.validation.pscType.blank;
            }

            // validate additional form fields here
            if (!Object.keys(this.errors.stack).length) {
                return Promise.resolve({});
            } else {
                return Promise.reject(this.errors);
            }
        } catch (err) {
            this.errors.serverError = this.errorManifest.generic.serverError;
            return Promise.reject(this.errors);
        }
    }

    validateRleVerificationStatus (payload: any): Promise<any> {
        return Promise.resolve({});
    }

    validateRelevantOfficerDetails (payload: any): Promise<any> {
        return Promise.resolve({});
    }

    validateRelevantOfficerConfirmationStatements (payload: any): Promise<any> {
        return Promise.resolve({});
    }
};

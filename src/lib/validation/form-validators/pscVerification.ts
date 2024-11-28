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

    validatePersonalCode (payload: any, _lang: string, pscName: string): Promise<Object> {
        logger.info(`Request to validate Personal Code form`);
        this.errorManifest = errorManifest(this.lang, pscName);

        try {
            if (typeof payload.personalCode === "undefined" || payload.personalCode === "") {
                this.errors.stack.personalCode = this.errorManifest.validation.personalCode.blank;
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

    validateIndividualStatement (payload: any, _lang: string, pscName: string): Promise<Object> {
        logger.info(`Request to validate Individual Statement form`);
        this.errorManifest = errorManifest(this.lang, pscName);

        try {
            if (typeof payload.pscIndividualStatement === "undefined" || payload.pscIndividualStatement === "") {
                this.errors.stack.individualStatement = this.errorManifest.validation.individualStatement.blank;
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


};

import { logger } from "./../../logger";
import { GenericValidator } from "./../../validation/generic";
import errorManifest from "../../utils/error-manifests/errorManifest";

export class PscVerificationFormsValidator extends GenericValidator {

    constructor (lang: string = "en") {
        super();
        this.lang = lang;
    }

    validatePersonalCode (payload: any, _lang: string, pscName: string): Promise<Object> {
        return this.validateForm(payload, "personalCode", "personalCode", pscName);
    }

    validateNameMismatch (payload: any, _lang: string, pscName: string): Promise<Object> {
        return this.validateForm(payload, "nameMismatch", "nameMismatch", pscName);
    }

    validateIndividualStatement (payload: any, _lang: string, pscName: string): Promise<Object> {
        return this.validateForm(payload, "pscIndividualStatement", "individualStatement", pscName);
    }

    private validateForm (payload: any, fieldName: string, errorKey: string, pscName: string): Promise<Object> {
        logger.debug(`validating ${errorKey} form for ${pscName}`);
        this.errorManifest = errorManifest(this.lang);

        try {
            this.validateForEmptyField(payload, fieldName, errorKey);

            // validate additional form fields here
            if (!Object.keys(this.errors.stack).length) {
                return Promise.resolve({});
            } else {
                return Promise.reject(this.errors);
            }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (err) {
            this.errors.serverError = this.errorManifest.generic.serverError;
            return Promise.reject(this.errors);
        }
    }

    private validateForEmptyField (payload: any, fieldName: string, errorKey: string): void {
        if (typeof payload[fieldName] === "undefined" || payload[fieldName] === "") {
            logger.debug(`required field '${fieldName}' is either empty or undefined`);
            this.errors.stack[fieldName] = this.errorManifest.validation[errorKey].blank;
        }
    }

}

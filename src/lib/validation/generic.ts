// Single field validators that are called by the form validators or "field-group" validators

import { logger } from "./../logger";
import errorManifest from "../utils/error-manifests/errorManifest";

export class GenericValidator {

    errors: any;
    payload: any;
    errorManifest: any;
    lang: string;

    constructor (lang: string = "en") {
        this.lang = lang;
        this.errorManifest = errorManifest(this.lang);
        this.errors = this.getErrorSignature();
    }

    protected getErrorSignature () {
        this.errorManifest = errorManifest(this.lang);
        return {
            status: 400,
            name: "VALIDATION_ERRORS",
            message: this.errorManifest.validation.default.summary,
            stack: {}
        };
    }

    isValidPscType (pscType: string): boolean {
        logger.info(`Request to validate PSC Type`);
        // List of PSC types can be separated out into a util file
        if (["individual", "rle"].includes(pscType)) {
            return true;
        }
        return false;
    }

    isValidFirstName (firstName: string): boolean {
        logger.info(`Request to validate email: ${firstName}`);
        const regex = /^[a-z\d_-][a-z\d_\-.\s&]{1,71}$/ig;
        if (regex.test(firstName)) {
            return true;
        }
        return false;
    }

    isValidMiddleName (middleName: string): boolean {
        logger.info(`Request to validate company name: ${middleName}`);
        const regex = /^[a-z\d_-][a-z\d_\-.\s&]{1,71}$/ig;
        if (regex.test(middleName)) {
            return true;
        }
        return false;
    }

    isValidLastName (lastName: string): boolean {
        logger.info(`Request to validate company name: ${lastName}`);
        const regex = /^[a-z\d_-][a-z\d_\-.\s&]{1,71}$/ig;
        if (regex.test(lastName)) {
            return true;
        }
        return false;
    }

    isValidDateOfBirth (dob: string): boolean {
        logger.info(`Request to validate PostCode: ${dob}`);

        // use Luxon to validate DOB

        if (dob) {
            return true;
        }
        return false;
    }
};

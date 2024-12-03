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

    // TODO - remove with PSC type functionality
    isValidPscType (pscType: string): boolean {
        logger.info(`Request to validate PSC Type`);
        // List of PSC types can be separated out into a util file
        if (["individual", "rle"].includes(pscType)) {
            return true;
        }
        return false;
    }

    // TODO - check if required for DOB mismatch validation
    isValidDateOfBirth (dob: string): boolean {
        logger.info(`Request to validate DOB: ${dob}`);

        // use Luxon to validate DOB

        if (dob) {
            return true;
        }
        return false;
    }
};

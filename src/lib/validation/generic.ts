// Single field validators that are called by the form validators or "field-group" validators

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

}

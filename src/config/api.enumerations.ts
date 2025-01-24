import fs from "fs";
import yaml from "js-yaml";

const PSC_VERIFICATION_PATH: string = "api-enumerations/psc_verification.yml";
const COMPANY_CATEGORY: string = "company";
const VALIDATION_CATEGORY: string = "validation";
export const COMPANY_STATUS_NOT_ALLOWED = "status-not-allowed";
export const COMPANY_TYPE_ALLOWED = "type-allowed";

const pscVerification = yaml.load(fs.readFileSync(PSC_VERIFICATION_PATH, "utf8"));

export const getPscVerificationCompanyLists = (descriptionKey: string): string[] => {
    return pscVerification[COMPANY_CATEGORY][descriptionKey] || descriptionKey;
};

export const getPscValidationMessages = (descriptionKey: string): string[] => {
    return pscVerification[VALIDATION_CATEGORY][descriptionKey] || descriptionKey;
};

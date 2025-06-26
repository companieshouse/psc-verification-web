import fs from "fs";
import yaml from "js-yaml";

interface PscVerification {
    company: Record<string, string[]>;
    validation: Record<string, string>;
};

const PSC_VERIFICATION_PATH: string = "api-enumerations/psc_verification.yml";
const COMPANY_CATEGORY:keyof PscVerification = "company";
const VALIDATION_CATEGORY:keyof PscVerification = "validation";
export const COMPANY_STATUS_NOT_ALLOWED = "status-not-allowed";
export const COMPANY_TYPE_ALLOWED = "type-allowed";

const pscVerification = yaml.load(fs.readFileSync(PSC_VERIFICATION_PATH, "utf8")) as PscVerification;

export const getPscVerificationCompanyLists = (descriptionKey: string): string[] => {
    return pscVerification[COMPANY_CATEGORY]?.[descriptionKey] ?? [descriptionKey];
};

export const getPscValidationMessage = (descriptionKey: string): string => {
    return pscVerification[VALIDATION_CATEGORY]?.[descriptionKey] ?? descriptionKey;
};

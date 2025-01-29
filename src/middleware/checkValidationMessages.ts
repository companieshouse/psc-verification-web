import { getPscValidationMessages } from "../config/api.enumerations";

const FORENAMES_MISMATCH: string = "forenames-mismatch";
const SURNAME_MISMATCH: string = "surname-mismatch";
const NO_NAME_MISMATCH: string = "no-name-mismatch-reason";
const DOB_MISMATCH: string = "dob-mismatch";
const UNKNOWN_UVID: string = "unknown-uvid";
const EXPIRED_UVID: string = "expired-uvid";
const INVALID_RECORD: string = "invalid-record";

const getValidationMessages = (keys: string[]): string[] => {
    return keys.map(key => getPscValidationMessages(key)).reduce((acc, val) => acc.concat(val), []);
};

export const getNameValidationMessages = (): string[] => {
    const keysToInclude = [FORENAMES_MISMATCH, SURNAME_MISMATCH, NO_NAME_MISMATCH];
    return getValidationMessages(keysToInclude);
};

export const getDobValidationMessage = (): string[] => {
    const keysToInclude = [DOB_MISMATCH];
    return getValidationMessages(keysToInclude);
};

export const getUvidValidationMessage = (): string[] => {
    const keysToInclude = [UNKNOWN_UVID, EXPIRED_UVID, INVALID_RECORD];
    return getValidationMessages(keysToInclude);
};

import { getPscValidationMessage } from "../config/api.enumerations";

const NO_NAME_MISMATCH: string = "no-name-mismatch-reason";
const DOB_MISMATCH: string = "dob-mismatch";
const UNKNOWN_UVID: string = "unknown-uvid";
const EXPIRED_UVID: string = "expired-uvid";
const INVALID_RECORD: string = "invalid-record";

export const getNameValidationMessage = (): string[] => [
    getPscValidationMessage(NO_NAME_MISMATCH)
];

export const getDobValidationMessage = (): string[] => [
    getPscValidationMessage(DOB_MISMATCH)
];

export const getUvidValidationMessages = (): string[] => [
    getPscValidationMessage(UNKNOWN_UVID),
    getPscValidationMessage(EXPIRED_UVID),
    getPscValidationMessage(INVALID_RECORD)
];

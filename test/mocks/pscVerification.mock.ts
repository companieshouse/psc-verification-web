import { Resource } from "@companieshouse/api-sdk-node";
import { Links, NameMismatchReasonEnum, PlannedMaintenance, PscVerification, PscVerificationData, ValidationStatusError, ValidationStatusResponse, VerificationStatementEnum } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { ApiErrorResponse } from "@companieshouse/api-sdk-node/dist/services/resource";
import { HttpStatusCode } from "axios";

export const FIRST_DATE = new Date(2024, 0, 2, 3, 4, 5, 6);
export const SECOND_DATE = new Date(2024, 0, 2, 3, 0, 0, 0);
export const DOB_DATE = new Date("1970-01-01");
export const COMPANY_NUMBER = "12345678";
export const TRANSACTION_ID = "11111-22222-33333";
export const PSC_NOTIFICATION_ID = "123456";
export const PSC_VERIFICATION_ID = "662a0de6a2c6f9aead0f32ab";
export const UVID = "123abc456edf";
export const SELF_URI = `/transactions/${TRANSACTION_ID}/persons-with-significant-control-verification/${PSC_VERIFICATION_ID}`;

export const INITIAL_PSC_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID
};

export const LINKS: Links = {
    self: SELF_URI,
    validationStatus: ""
};

export const INDIVIDUAL_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        uvid: UVID,
        verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
    }
};

export const INDIVIDUAL_DATA_NAME_MISMATCH: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED],
        nameMismatchReason: NameMismatchReasonEnum.TRANSLATION_OR_DIFF_CONV
    }
};

export const PATCHED_PERSONAL_CODE_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        uvid: UVID
    }
};

export const PATCHED_PERSONAL_CODE_WITH_NAME_MISMATCH_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        uvid: UVID,
        nameMismatchReason: NameMismatchReasonEnum.NOT_TO_SAY
    }
};

export const INITIAL_PERSONAL_CODE_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        uvid: ""
    }
};

export const NAME_MISMATCH_DATA_UNDEFINED: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        nameMismatchReason: undefined
    }
};

export const PATCHED_NAME_MISMATCH_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        nameMismatchReason: NameMismatchReasonEnum.LEGALLY_CHANGED
    }
};

export const PATCH_INDIVIDUAL_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID
};

export const PATCH_INDIVIDUAL_STATEMENT_DATA: PscVerificationData = {
    verificationDetails: {
        verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
    }
};

export const PATCH_PERSONAL_CODE_DATA: PscVerificationData = {
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        uvid: UVID
    }
};

export const PATCH_NAME_MISMATCH_DATA: PscVerificationData = {
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        nameMismatchReason: NameMismatchReasonEnum.PREFERRED_NAME
    }
};

export const PATCH_BLANK_PERSONAL_CODE_DATA: PscVerificationData = {
    verificationDetails: {
        uvid: ""
    }
};

export const PATCH_INDIVIDUAL_STATEMENT: PscVerification = {
    data: PATCH_INDIVIDUAL_STATEMENT_DATA,
    createdAt: FIRST_DATE,
    updatedAt: FIRST_DATE,
    links: LINKS
};

export const PATCHED_INDIVIDUAL_STATEMENT_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscNotificationId: PSC_NOTIFICATION_ID,
    verificationDetails: {
        nameMismatchReason: NameMismatchReasonEnum.PREFERRED_NAME,
        verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
    }
};

export const PATCHED_INDIVIDUAL_STATEMENT: PscVerification = {
    data: PATCHED_INDIVIDUAL_STATEMENT_DATA,
    createdAt: FIRST_DATE,
    updatedAt: FIRST_DATE,
    links: LINKS
};

export const PLANNED_MAINTENANCE: PlannedMaintenance = {
    status: "UP",
    message: "",
    maintenance_start_time: FIRST_DATE,
    maintenance_end_time: FIRST_DATE
};

function initPscVerification (data: PscVerificationData) {
    return {
        createdAt: FIRST_DATE,
        updatedAt: FIRST_DATE,
        data: {
            ...data
        },
        links: {
            self: SELF_URI,
            validationStatus: `${SELF_URI}/validation_status`
        }

    } as PscVerification;
}

// validation status mocks
export const VALIDATION_STATUS_RESP_VALID: ValidationStatusResponse = {
    isValid: true,
    errors: []
};

export const VALIDATION_STATUS_RESOURCE_VALID: Resource<ValidationStatusResponse> = {
    resource: VALIDATION_STATUS_RESP_VALID,
    httpStatusCode: HttpStatusCode.Ok
};

const createMockValidationStatusError = (errorMessage: string): ValidationStatusError => {
    return {
        error: errorMessage,
        location: "$.uvid_match",
        type: "ch:validation",
        locationType: "json-path"
    };
};

export const mockValidationStatusDobError: ValidationStatusError = createMockValidationStatusError("The details linked to this personal code do not match the details on our records");

export const VALIDATION_STATUS_INVALID_DOB: ValidationStatusResponse = {
    errors: [mockValidationStatusDobError],
    isValid: false
};

export const VALIDATION_STATUS_RESOURCE_INVALID_DOB: Resource<ValidationStatusResponse> = {
    resource: VALIDATION_STATUS_INVALID_DOB,
    httpStatusCode: HttpStatusCode.Ok
};

export const mockValidationStatusUvidError: ValidationStatusError = createMockValidationStatusError("UVID is not recognised");

export const VALIDATION_STATUS_INVALID_UVID: ValidationStatusResponse = {
    errors: [mockValidationStatusUvidError],
    isValid: false
};

export const VALIDATION_STATUS_RESOURCE_INVALID_UVID: Resource<ValidationStatusResponse> = {
    resource: VALIDATION_STATUS_INVALID_UVID,
    httpStatusCode: HttpStatusCode.Ok
};

export const mockValidationStatusNameError: ValidationStatusError = createMockValidationStatusError("The name on the public register is different to the name this PSC used for identity verification: a name mismatch reason must be provided");

export const VALIDATION_STATUS_INVALID_NAME: ValidationStatusResponse = {
    errors: [mockValidationStatusNameError],
    isValid: false
};

export const VALIDATION_STATUS_RESOURCE_INVALID_NAME: Resource<ValidationStatusResponse> = {
    resource: VALIDATION_STATUS_INVALID_NAME,
    httpStatusCode: HttpStatusCode.Ok
};

export const VALIDATION_STATUS_INVALID_DOB_NAME: ValidationStatusResponse = {
    errors: [mockValidationStatusNameError, mockValidationStatusDobError],
    isValid: false
};

export const VALIDATION_STATUS_RESOURCE_INVALID_DOB_NAME: Resource<ValidationStatusResponse> = {
    resource: VALIDATION_STATUS_INVALID_DOB_NAME,
    httpStatusCode: HttpStatusCode.Ok
};

// Patch responses
export const PATCH_RESP_WITH_NAME_MISMATCH: Resource<PscVerification> = {
    resource: initPscVerification(PATCHED_PERSONAL_CODE_WITH_NAME_MISMATCH_DATA),
    httpStatusCode: HttpStatusCode.Ok
};

export const PATCH_RESP_NO_NAME_MISMATCH: Resource<PscVerification> = {
    resource: initPscVerification(PATCHED_PERSONAL_CODE_DATA),
    httpStatusCode: HttpStatusCode.Ok
};

export interface ApiError {
    error?: string;
    errorValues?: Record<string, string>;
    location?: string;
    locationType?: string;
    type?: string;
}

// Error response
export const mockOutOfServiceResponse: ApiErrorResponse = {
    httpStatusCode: 500,
    errors: [
        {
            error: "failed to execute http request"
        }
    ]
};

// Returns the PSC verification with data fields in camel case
export const INDIVIDUAL_VERIFICATION_CREATED: PscVerification = initPscVerification(INITIAL_PSC_DATA);
export const INDIVIDUAL_VERIFICATION_FULL: PscVerification = initPscVerification(INDIVIDUAL_DATA);
export const INDIVIDUAL_VERIFICATION_FULL_NAME_MISMATCH: PscVerification = initPscVerification(INDIVIDUAL_DATA_NAME_MISMATCH);
export const IND_VERIFICATION_PERSONAL_CODE: PscVerification = initPscVerification(INITIAL_PERSONAL_CODE_DATA);
export const IND_VERIFICATION_PERSONAL_CODE_DEFINED: PscVerification = initPscVerification(PATCHED_PERSONAL_CODE_DATA);
export const IND_VERIFICATION_NAME_MISMATCH_DEFINED: PscVerification = initPscVerification(PATCHED_PERSONAL_CODE_WITH_NAME_MISMATCH_DATA);
export const IND_VERIFICATION_NAME_MISMATCH_UNDEFINED: PscVerification = initPscVerification(NAME_MISMATCH_DATA_UNDEFINED);
export const INDIVIDUAL_VERIFICATION_PATCH: PscVerification = initPscVerification(PATCH_INDIVIDUAL_DATA);

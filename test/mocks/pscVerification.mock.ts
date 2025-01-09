
import { Links, NameMismatchReasonEnum, PscVerification, PscVerificationData, ValidationStatusError, ValidationStatusResponse, VerificationStatementEnum } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";

export const FIRST_DATE = new Date(2024, 0, 2, 3, 4, 5, 6);
export const DOB_DATE = new Date("1970-01-01");
export const COMPANY_NUMBER = "12345678";
export const TRANSACTION_ID = "11111-22222-33333";
export const PSC_APPOINTMENT_ID = "123456";
export const PSC_VERIFICATION_ID = "662a0de6a2c6f9aead0f32ab";
export const UVID = "123abc456edf";
export const SELF_URI = `/transactions/${TRANSACTION_ID}/persons-with-significant-control-verification/${PSC_VERIFICATION_ID}`;

export const INITIAL_PSC_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_APPOINTMENT_ID
};

export const LINKS: Links = {
    self: SELF_URI,
    validationStatus: ""
};

export const INDIVIDUAL_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_APPOINTMENT_ID,
    verificationDetails: {
        verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
    }
};

export const PATCHED_PERSONAL_CODE_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_APPOINTMENT_ID,
    verificationDetails: {
        uvid: UVID
    }
};

export const INITIAL_PERSONAL_CODE_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_APPOINTMENT_ID,
    verificationDetails: {
        uvid: ""
    }
};

export const INITIAL_NAME_MISMATCH_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_APPOINTMENT_ID,
    verificationDetails: {
        nameMismatchReason: undefined
    }
};

export const PATCHED_NAME_MISMATCH_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_APPOINTMENT_ID,
    verificationDetails: {
        nameMismatchReason: NameMismatchReasonEnum.LEGAL_NAME_CHANGE
    }
};

export const PATCH_INDIVIDUAL_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_APPOINTMENT_ID
};

export const PATCH_RLE_DATA: PscVerificationData = {
    verificationDetails: {
        nameMismatchReason: NameMismatchReasonEnum.PREFERRED_NAME
    }
};

export const PATCH_INDIVIDUAL_STATEMENT_DATA: PscVerificationData = {
    verificationDetails: {
        verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
    }
};

export const PATCH_PERSONAL_CODE_DATA: PscVerificationData = {
    pscAppointmentId: PSC_APPOINTMENT_ID,
    verificationDetails: {
        uvid: UVID
    }
};

export const PATCH_NAME_MISMATCH_DATA: PscVerificationData = {
    pscAppointmentId: PSC_APPOINTMENT_ID,
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
    pscAppointmentId: PSC_APPOINTMENT_ID,
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

export const RLE_DATA_FULL: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_APPOINTMENT_ID,
    relevantOfficer: {
        nameElements: {
            title: "Sir",
            forename: "Forename",
            middleName: "Middlename",
            surname: "Surname"
        },
        dateOfBirth: DOB_DATE,
        isDirector: true,
        isEmployee: true
    },
    verificationDetails: {
        verificationStatements: [VerificationStatementEnum.RO_DECLARATION, VerificationStatementEnum.RO_IDENTIFIED, VerificationStatementEnum.RO_VERIFIED]
    }
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
export const VALIDATION_STATUS_VALID: ValidationStatusResponse = {
    isValid: true,
    errors: []
};

export const createMockValidationStatusError = (errorMessage: string) : ValidationStatusError => {
    return {
        error: errorMessage,
        location: "$.uvid_match",
        type: "ch:validation",
        locationType: "json-path"
    };
};

export const mockValidationStatusNameError: ValidationStatusError = createMockValidationStatusError("The name on the public register is different to the name this PSC used for identity verification: a name mismatch reason must be provided");

export const VALIDATION_STATUS_INVALID: ValidationStatusResponse = {
    errors: [
        mockValidationStatusNameError
    ],
    isValid: false
};

// Returns the PSC verification with data fields in camel case
export const INDIVIDUAL_VERIFICATION_CREATED: PscVerification = initPscVerification(INITIAL_PSC_DATA);
export const INDIVIDUAL_VERIFICATION_FULL: PscVerification = initPscVerification(INDIVIDUAL_DATA);
export const IND_VERIFICATION_PERSONAL_CODE: PscVerification = initPscVerification(INITIAL_PERSONAL_CODE_DATA);
export const IND_VERIFICATION_NAME_MISMATCH: PscVerification = initPscVerification(INITIAL_NAME_MISMATCH_DATA);
export const INDIVIDUAL_VERIFICATION_PATCH: PscVerification = initPscVerification(PATCH_INDIVIDUAL_DATA);
export const RLE_VERIFICATION_PATCH: PscVerification = initPscVerification(PATCH_RLE_DATA);
export const RLE_VERIFICATION_FULL: PscVerification = initPscVerification(RLE_DATA_FULL);

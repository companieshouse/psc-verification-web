import { Links, NameMismatchReasonEnum, PscVerification, PscVerificationData, PscVerificationDataResource, VerificationStatementEnum } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";
import { PSC_ID } from "./psc.mock";

export const FIRST_DATE = new Date(2024, 0, 2, 3, 4, 5, 6);
export const DOB_DATE = new Date("1970-01-01");
export const COMPANY_NUMBER = "12345678";
export const TRANSACTION_ID = "11111-22222-33333";
export const PSC_VERIFICATION_ID = "662a0de6a2c6f9aead0f32ab";
export const UVID = "123abc456edf";
export const SELF_URI = `/transactions/${TRANSACTION_ID}/persons-with-significant-control-verification/${PSC_VERIFICATION_ID}`;

export const INITIAL_PSC_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER
};

export const INITIAL_PSC_DATA_RESOURCE: PscVerificationDataResource = {
    company_number: COMPANY_NUMBER
};

export const LINKS: Links = {
    self: SELF_URI,
    validationStatus: ""
};

export const INDIVIDUAL_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_VERIFICATION_ID,
    verificationDetails: {
        nameMismatchReason: NameMismatchReasonEnum.MAIDEN_NAME,
        verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
    }
};

export const INDIVIDUAL_DATA_RESOURCE: PscVerificationDataResource = {
    company_number: COMPANY_NUMBER,
    psc_appointment_id: PSC_VERIFICATION_ID,
    verification_details: {
        name_mismatch_reason: NameMismatchReasonEnum.MAIDEN_NAME,
        verification_statements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
    }
};

export const PATCH_INDIVIDUAL_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_ID
};

export const PATCH_INDIVIDUAL_DATA_RESOURCE: PscVerificationDataResource = {
    company_number: COMPANY_NUMBER,
    psc_appointment_id: PSC_ID
};

export const PATCH_RLE_DATA: PscVerificationData = {
    verificationDetails: {
        nameMismatchReason: NameMismatchReasonEnum.PREFERRED_NAME
    }
};

export const PATCH_RLE_DATA_RESOURCE: PscVerificationDataResource = {
    verification_details: {
        name_mismatch_reason: NameMismatchReasonEnum.PREFERRED_NAME
    }
};

export const PATCH_INDIVIDUAL_STATEMENT_DATA: PscVerificationData = {
    verificationDetails: {
        verificationStatements: [VerificationStatementEnum.INDIVIDUAL_VERIFIED]
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
    pscAppointmentId: PSC_VERIFICATION_ID,
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

export const RLE_DATA: PscVerificationData = {
    companyNumber: COMPANY_NUMBER,
    pscAppointmentId: PSC_VERIFICATION_ID,
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
        nameMismatchReason: NameMismatchReasonEnum.MAIDEN_NAME,
        verificationStatements: [VerificationStatementEnum.RO_DECLARATION, VerificationStatementEnum.RO_IDENTIFIED, VerificationStatementEnum.RO_VERIFIED]
    }
};

export const RLE_DATA_RESOURCE: PscVerificationDataResource = {
    company_number: COMPANY_NUMBER,
    psc_appointment_id: PSC_VERIFICATION_ID,
    relevant_officer: {
        name_elements: {
            title: "Sir",
            forename: "Forename",
            middlename: "Middlename",
            surname: "Surname"
        },
        date_of_birth: DOB_DATE,
        is_director: true,
        is_employee: true
    },
    verification_details: {
        name_mismatch_reason: NameMismatchReasonEnum.MAIDEN_NAME,
        verification_statements: [VerificationStatementEnum.RO_DECLARATION, VerificationStatementEnum.RO_IDENTIFIED, VerificationStatementEnum.RO_VERIFIED]
    }
};

function initPscVerification (data: PscVerificationDataResource) {
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

export const CREATED_RESOURCE: PscVerification = initPscVerification(INITIAL_PSC_DATA_RESOURCE);
export const PATCHED_INDIVIDUAL_RESOURCE: PscVerification = initPscVerification(PATCH_INDIVIDUAL_DATA_RESOURCE);
export const PATCHED_RLE_RESOURCE: PscVerification = initPscVerification(PATCH_RLE_DATA_RESOURCE);
export const INDIVIDUAL_RESOURCE: PscVerification = initPscVerification(INDIVIDUAL_DATA_RESOURCE);
export const RLE_RESOURCE: PscVerification = initPscVerification(RLE_DATA_RESOURCE);

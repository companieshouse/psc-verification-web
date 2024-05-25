import { NameMismatchReason, PscVerification, PscVerificationResource, VerificationStatement } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";

export const FIRST_DATE = new Date(2024, 0, 2, 3, 4, 5, 6);
export const DOB_DATE = new Date("1970-01-01");
export const COMPANY_NUMBER = "12345678";
export const TRANSACTION_ID = "11111-22222-33333";
export const PSC_VERIFICATION_ID = "662a0de6a2c6f9aead0f32ab";
export const SELF_URI = `/transactions/${TRANSACTION_ID}/persons-with-significant-control-verification/${PSC_VERIFICATION_ID}`;

export const INITIAL_DATA: PscVerification = {
    company_number: COMPANY_NUMBER
};

export const INDIVIDUAL_DATA: PscVerification = {
    company_number: COMPANY_NUMBER,
    psc_appointment_id: PSC_VERIFICATION_ID,
    verification_details: {
        name_mismatch_reason: NameMismatchReason.MAIDEN_NAME,
        verification_statements: [VerificationStatement.INDIVIDUAL_VERIFIED]
    }
};

export const PATCHED_INDIVIDUAL_PSC_ID_DATA: PscVerification = {
    company_number: COMPANY_NUMBER,
    psc_appointment_id: PSC_VERIFICATION_ID
};

export const PATCH_INDIVIDUAL_DATA: PscVerification = {
    verification_details: {
        name_mismatch_reason: NameMismatchReason.PREFERRED_NAME
    }
};

export const PATCHED_INDIVIDUAL_DATA: PscVerification = {
    company_number: COMPANY_NUMBER,
    psc_appointment_id: PSC_VERIFICATION_ID,
    verification_details: {
        name_mismatch_reason: NameMismatchReason.PREFERRED_NAME,
        verification_statements: [VerificationStatement.INDIVIDUAL_VERIFIED]
    }
};

export const RLE_DATA: PscVerification = {
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
        name_mismatch_reason: NameMismatchReason.MAIDEN_NAME,
        verification_statements: [VerificationStatement.RO_DECLARATION, VerificationStatement.RO_IDENTIFIED, VerificationStatement.RO_VERIFIED]
    }
};

function initPscVerificationResource (data: PscVerification) {
    return {
        created_at: FIRST_DATE,
        updated_at: FIRST_DATE,
        data: {
            ...data
        },
        links: {
            self: SELF_URI,
            validation_status: `${SELF_URI}/validation_status`
        }

    } as PscVerificationResource;
}

export const CREATED_RESOURCE: PscVerificationResource = initPscVerificationResource(INITIAL_DATA);
export const PATCHED_INDIVIDUAL_RESOURCE: PscVerificationResource = initPscVerificationResource(PATCHED_INDIVIDUAL_DATA);
export const PATCHED_INDIVIDUAL_RESOURCE_PSC_ID: PscVerificationResource = initPscVerificationResource(PATCHED_INDIVIDUAL_PSC_ID_DATA);
export const INDIVIDUAL_RESOURCE: PscVerificationResource = initPscVerificationResource(INDIVIDUAL_DATA);
export const RLE_RESOURCE: PscVerificationResource = initPscVerificationResource(RLE_DATA);

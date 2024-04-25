import { PscVerification, PscVerificationResource } from "@companieshouse/api-sdk-node/dist/services/psc-verification-link/types";

export const FIRST_DATE = new Date(2024, 0, 2, 3, 4, 5, 6);
export const TRANSACTION_ID = "11111-22222-33333";
export const FILING_ID = "3948934234982340";
export const COMPANY_NUMBER = "12345678";
export const SELF_URI = `/transactions/${TRANSACTION_ID}/persons-with-significant-control-verification/${FILING_ID}`;

export const INITIAL_DATA: PscVerification = {
    company_number: COMPANY_NUMBER
};
export const CREATED_RESOURCE: PscVerificationResource = {
    created_at: FIRST_DATE,
    updated_at: FIRST_DATE,
    data: {
        ...INITIAL_DATA,
        psc_appointment_id: "",
        verification_details: { verification_statements: [] }
    },
    links: {
        self: SELF_URI,
        validation_status: `${SELF_URI}/validation_status`
    }
};

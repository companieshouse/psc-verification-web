import { PersonWithSignificantControl, PscVerificationState, VerificationStatusEnum } from "@companieshouse/api-sdk-node/dist/services/psc/types";
import { PSC_KIND_TYPE } from "../../src/constants";

export const COMPANY_NUMBER = "12345678";
export const PSC_ID = "67edfE436y35hetsie6zuAZtr";

const PSC_VERIFICATION_STATE: PscVerificationState = {
    verificationStatus: VerificationStatusEnum.UNVERIFIED,
    verificationStartDate: new Date("2024-04-13"),
    verificationStatementDueDate: new Date("2024-04-27")
};

export const PSC_INDIVIDUAL: PersonWithSignificantControl = {
    naturesOfControl: ["ownership-of-shares-75-to-100-percent", "voting-rights-75-to-100-percent-as-trust"],
    kind: PSC_KIND_TYPE.INDIVIDUAL,
    name: "Sir Forename Middlename Surname",
    nameElements: {
        title: "Sir",
        forename: "Forename",
        middleName: "Middlename",
        surname: "Surname"
    },
    nationality: "British",
    address: {
        postalCode: "CF14 3UZ",
        locality: "Cardiff",
        region: "South Glamorgan",
        addressLine1: "Crown Way"
    },
    countryOfResidence: "Wales",
    links: {
        self: `/company/${COMPANY_NUMBER}/persons-with-significant-control/individual/${PSC_ID}`
    },
    dateOfBirth: { year: "2000", month: "04" },
    etag: "etag",
    notifiedOn: "2023-01-31",
    verificationState: PSC_VERIFICATION_STATE
};

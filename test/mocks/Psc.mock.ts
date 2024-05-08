import { PersonWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/psc/types";

export const COMPANY_NUMBER = "12345678";
export const PSC_ID = "67edfE436y35hetsie6zuAZtr";

export const PSC_INDIVIDUAL: PersonWithSignificantControlResource = {
    natures_of_control: ["ownership-of-shares-75-to-100-percent", "voting-rights-75-to-100-percent-as-trust"],
    kind: "individual-person-with-significant-control",
    name: "Sir Forename Middlename Surname",
    name_elements: {
        title: "Sir",
        forename: "Forename",
        middle_name: "Middlename",
        surname: "Surname"
    },
    nationality: "British",
    address: {
        postal_code: "CF14 3UZ",
        locality: "Cardiff",
        region: "South Glamorgan",
        address_line_1: "Crown Way"
    },
    country_of_residence: "Wales",
    links: {
        self: `/company/${COMPANY_NUMBER}/persons-with-significant-control/individual/${PSC_ID}`
    },
    date_of_birth: { year: "2000", month: "04" },
    etag: "",
    notified_on: ""
};

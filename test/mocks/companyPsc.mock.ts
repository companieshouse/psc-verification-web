import { CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";

export const COMPANY_NUMBER = "12345678";

export const EMPTY_COMPANY_PSC_LIST: CompanyPersonsWithSignificantControlResource = {
    ceased_count: "0",
    items_per_page: "0",
    total_results: "0",
    active_count: "0",
    links: {
        self: "company/123456/persons-with-significant-control"
    },
    items: []
};

export const VALID_COMPANY_PSC_LIST: CompanyPersonsWithSignificantControlResource = {
    ceased_count: "2",
    items_per_page: "25",
    total_results: "3",
    active_count: "2",
    links: {
        self: "company/123456/persons-with-significant-control"
    },
    items: [
        {
            natures_of_control: [
                "ownership-of-shares-50-to-75-percent-as-trust",
                "ownership-of-shares-50-to-75-percent",
                "ownership-of-shares-25-to-50-percent-as-trust",
                "ownership-of-shares-25-to-50-percent"
            ],
            kind: "corporate-entity-person-with-significant-control",
            name_elements: {
                forename: "",
                other_forenames: "",
                surname: "",
                title: ""
            },
            name: "Racing Cars LTD",
            notified_on: "2024-03-13",
            address: {
                postal_code: "CF14 3UZ",
                premises: "1",
                locality: "Cardiff",
                address_line_1: "34 Silver Street",
                address_line_2: "Silverstone",
                careOf: "Care of",
                poBox: "Po Box",
                region: "UK"
            },
            country_of_residence: "Wales",
            nationality: "",
            date_of_birth: {
                year: "",
                month: ""
            },
            links: {
                self: "/company/32518264/persons-with-significant-control/corporate-entity/NTgxNTQxMDg5NkVNUVI4QVdZ"
            },
            etag: "0bc48abc08dec4a6d4dc4c4b895a87d131926cb2",
            identification: {
                country_registered: "UK",
                legal_authority: "Legal Authority",
                legal_form: "Legal Form",
                place_registered: "Wales",
                registration_number: "123456"
            }
        },
        {
            natures_of_control: [
                "ownership-of-shares-25-to-50-percent-as-trust"
            ],
            kind: "individual-person-with-significant-control",
            name_elements: {
                forename: "Jim",
                surname: "Testerly",
                title: "Mr"
            },
            name: "Mr Jim Testerly",
            notified_on: "2024-03-13",
            nationality: "British",
            address: {
                postal_code: "CF14 3UZ",
                premises: "1",
                locality: "Cardiff",
                address_line_1: "34 Silver Street",
                address_line_2: "Silverstone",
                careOf: "Care of",
                poBox: "Po Box",
                region: "UK"
            },
            country_of_residence: "Wales",
            date_of_birth: {
                year: "2024",
                month: "1"
            },
            links: {
                self: "/company/123456/persons-with-significant-control/individual/Nzc2MDM0MzIyNlc3RktGR0I4"
            },
            etag: "223a177a441ad66021b14e22f1ed3e0060958761"
        },
        {
            natures_of_control: [
                "ownership-of-shares-25-to-50-percent-as-trust"
            ],
            kind: "individual-person-with-significant-control",
            name_elements: {
                forename: "Test",
                other_forenames: "Tester",
                surname: "Testington",
                title: "Mr"
            },
            name: "Mr Test Tester Testington",
            notified_on: "2024-03-13",
            nationality: "British",
            address: {
                postal_code: "CF14 3UZ",
                premises: "1",
                locality: "Cardiff",
                address_line_1: "34 Silver Street",
                address_line_2: "Silverstone",
                careOf: "Care of",
                poBox: "Po Box",
                region: "UK"
            },
            country_of_residence: "Wales",
            ceased_on: "2024-03-13",
            date_of_birth: {
                year: "2024",
                month: "1"
            },
            links: {
                self: "/company/123456/persons-with-significant-control/individual/Nzc2MDM0MzIyNlc3RktGR0I5"
            },
            etag: "223a177a441ad66021b14e22f1ed3e0060958762"
        }
    ]
};

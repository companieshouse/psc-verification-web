import { CompanyPersonsWithSignificantControlResource } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";

export const COMPANY_NUMBER = "12345678";

export const VALID_COMPANY_PSC_LIST: CompanyPersonsWithSignificantControlResource = {
    ceased_count: "0",
    items_per_page: "2",
    total_results: "2",
    active_count: "2",
    links: {
        self: "company/123456/persons-with-significant-control"
    },
    items: [
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

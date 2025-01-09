import { CompanyPersonsWithSignificantControl } from "@companieshouse/api-sdk-node/dist/services/company-psc/types";
import { PSC_KIND_TYPE } from "../../src/constants";

export const COMPANY_NUMBER = "12345678";

export const EMPTY_COMPANY_PSC_LIST: CompanyPersonsWithSignificantControl = {
    ceasedCount: "0",
    itemsPerPage: "0",
    totalResults: "0",
    activeCount: "0",
    links: {
        self: "company/123456/persons-with-significant-control"
    },
    items: []
};

export const INDIVIDUAL_PSCS_LIST = [
    {
        naturesOfControl: [
            "ownership-of-shares-25-to-50-percent-as-trust"
        ],
        kind: PSC_KIND_TYPE.INDIVIDUAL,
        nameElements: {
            forename: "Jim",
            surname: "Testerly",
            title: "Mr"
        },
        name: "Mr Jim Testerly",
        notifiedOn: "2024-03-13",
        nationality: "British",
        address: {
            postalCode: "CF14 3UZ",
            premises: "1",
            locality: "Cardiff",
            addressLine1: "34 Silver Street",
            addressLine2: "Silverstone",
            careOf: "Care of",
            poBox: "Po Box",
            region: "UK"
        },
        countryOfResidence: "Wales",
        dateOfBirth: {
            year: "1970",
            month: "1"
        },
        links: {
            self: "/company/123456/persons-with-significant-control/individual/PSC1"
        },
        etag: "ETAG1"
    },
    {
        naturesOfControl: [
            "ownership-of-shares-25-to-50-percent-as-trust"
        ],
        kind: PSC_KIND_TYPE.INDIVIDUAL,
        nameElements: {
            forename: "Test",
            otherForenames: "Tester",
            surname: "Testington",
            title: "Mr"
        },
        name: "Mr Test Tester Testington",
        notifiedOn: "2024-03-13",
        nationality: "British",
        address: {
            postalCode: "CF14 3UZ",
            premises: "1",
            locality: "Cardiff",
            addressLine1: "34 Silver Street",
            addressLine2: "Silverstone",
            careOf: "Care of",
            poBox: "Po Box",
            region: "UK"
        },
        countryOfResidence: "Wales",
        dateOfBirth: {
            year: "1997",
            month: "12"
        },
        links: {
            self: "/company/123456/persons-with-significant-control/individual/PSC2"
        },
        etag: "ETAG2"
    }
];

export const VALID_COMPANY_PSC_ITEMS = [
    {
        naturesOfControl: [
            "ownership-of-shares-50-to-75-percent-as-trust",
            "ownership-of-shares-50-to-75-percent",
            "ownership-of-shares-25-to-50-percent-as-trust",
            "ownership-of-shares-25-to-50-percent"
        ],
        kind: "corporate-entity-person-with-significant-control",
        nameElements: {
            forename: "",
            otherForenames: "",
            surname: "",
            title: ""
        },
        name: "Racing Cars LTD",
        notifiedOn: "2024-03-13",
        address: {
            postalCode: "CF14 3UZ",
            premises: "1",
            locality: "Cardiff",
            addressLine1: "34 Silver Street",
            addressLine2: "Silverstone",
            careOf: "Care of",
            poBox: "Po Box",
            region: "UK"
        },
        countryOfResidence: "Wales",
        nationality: "",
        dateOfBirth: {
            year: "",
            month: ""
        },
        links: {
            self: "/company/32518264/persons-with-significant-control/corporate-entity/NTgxNTQxMDg5NkVNUVI4QVdZ"
        },
        etag: "0bc48abc08dec4a6d4dc4c4b895a87d131926cb2",
        identification: {
            countryRegistered: "UK",
            legalAuthority: "Legal Authority",
            legalForm: "Legal Form",
            placeRegistered: "Wales",
            registrationNumber: "123456"
        }
    },
    {
        naturesOfControl: [
            "ownership-of-shares-25-to-50-percent-as-trust"
        ],
        kind: PSC_KIND_TYPE.INDIVIDUAL,
        nameElements: {
            forename: "Jim",
            surname: "Testerly",
            title: "Mr"
        },
        name: "Mr Jim Testerly",
        notifiedOn: "2024-03-13",
        nationality: "British",
        address: {
            postalCode: "CF14 3UZ",
            premises: "1",
            locality: "Cardiff",
            addressLine1: "34 Silver Street",
            addressLine2: "Silverstone",
            careOf: "Care of",
            poBox: "Po Box",
            region: "UK"
        },
        countryOfResidence: "Wales",
        dateOfBirth: {
            year: "1970",
            month: "1"
        },
        links: {
            self: "/company/123456/persons-with-significant-control/individual/Nzc2MDM0MzIyNlc3RktGR0I4"
        },
        etag: "223a177a441ad66021b14e22f1ed3e0060958761"
    },
    {
        naturesOfControl: [
            "ownership-of-shares-25-to-50-percent-as-trust"
        ],
        kind: PSC_KIND_TYPE.INDIVIDUAL,
        nameElements: {
            forename: "Test",
            otherForenames: "Tester",
            surname: "Testington",
            title: "Mr"
        },
        name: "Mr Test Tester Testington",
        notifiedOn: "2024-03-13",
        nationality: "British",
        address: {
            postalCode: "CF14 3UZ",
            premises: "1",
            locality: "Cardiff",
            addressLine1: "34 Silver Street",
            addressLine2: "Silverstone",
            careOf: "Care of",
            poBox: "Po Box",
            region: "UK"
        },
        countryOfResidence: "Wales",
        ceasedOn: "2024-03-13",
        dateOfBirth: {
            year: "1997",
            month: "12"
        },
        links: {
            self: "/company/123456/persons-with-significant-control/individual/Nzc2MDM0MzIyNlc3RktGR0I5"
        },
        etag: "223a177a441ad66021b14e22f1ed3e0060958762"
    }
];

export const VALID_COMPANY_PSC_LIST: CompanyPersonsWithSignificantControl = {
    ceasedCount: "2",
    itemsPerPage: "25",
    totalResults: "3",
    activeCount: "2",
    links: {
        self: "company/123456/persons-with-significant-control"
    },
    items: VALID_COMPANY_PSC_ITEMS
};

export const SUPER_SECURE_PSCS_EXCLUSIVE_LIST = [
    {
        kind: PSC_KIND_TYPE.SUPER_SECURE,
        description: "super-secure-persons-with-significant-control",
        notifiedOn: "2024-03-13",
        links: {
            self: "/company/123456/persons-with-significant-control/individual/PSC1"
        },
        etag: "ETAG1"
    },
    {
        kind: PSC_KIND_TYPE.SUPER_SECURE,
        description: "super-secure-persons-with-significant-control",
        notifiedOn: "2024-03-13",
        links: {
            self: "/company/123456/persons-with-significant-control/individual/PSC2"
        },
        etag: "ETAG2"
    }
];

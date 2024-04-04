import { CompanyProfile } from "@companieshouse/api-sdk-node/dist/services/company-profile/types";
import { LocalesService } from "@companieshouse/ch-node-utils";
import { toReadableFormat } from "../../utils/date";

export const buildAddress = (companyProfile: CompanyProfile): string => {
    var addressArray: string[] = [companyProfile.registeredOfficeAddress.poBox,
        companyProfile.registeredOfficeAddress.premises, companyProfile.registeredOfficeAddress.addressLineOne,
        companyProfile.registeredOfficeAddress.addressLineTwo, companyProfile.registeredOfficeAddress.locality,
        companyProfile.registeredOfficeAddress.region, companyProfile.registeredOfficeAddress.country,
        companyProfile.registeredOfficeAddress.postalCode];
    let address = "";
    for (const addressValue of addressArray) {
        if (addressValue != null && addressValue !== "") {
            address = address + addressValue;
            address = address + "<br>";
        }
    }
    return address;
};

export const formatForDisplay = (companyProfile: CompanyProfile, locales: LocalesService, lang: string): CompanyProfile => {
    companyProfile.type = locales.i18nCh.resolveSingleKey("company-type-" + companyProfile.type, lang);
    companyProfile.companyStatus = locales.i18nCh.resolveSingleKey("company-status-" + companyProfile.companyStatus, lang);
    companyProfile.dateOfCreation = toReadableFormat(companyProfile.dateOfCreation, lang);
    companyProfile.registeredOfficeAddress.premises = formatTitleCase(companyProfile.registeredOfficeAddress.premises);
    companyProfile.registeredOfficeAddress.addressLineOne = formatTitleCase(companyProfile.registeredOfficeAddress.addressLineOne);
    companyProfile.registeredOfficeAddress.addressLineTwo = formatTitleCase(companyProfile.registeredOfficeAddress.addressLineTwo);
    companyProfile.registeredOfficeAddress.locality = formatTitleCase(companyProfile.registeredOfficeAddress.locality);
    companyProfile.registeredOfficeAddress.region = formatTitleCase(companyProfile.registeredOfficeAddress.region);
    companyProfile.registeredOfficeAddress.country = formatTitleCase(companyProfile.registeredOfficeAddress.country);
    if (companyProfile.registeredOfficeAddress.postalCode != null) {
        companyProfile.registeredOfficeAddress.postalCode = companyProfile.registeredOfficeAddress.postalCode.toUpperCase();
    }
    if (companyProfile.registeredOfficeAddress.poBox != null) {
        companyProfile.registeredOfficeAddress.poBox = companyProfile.registeredOfficeAddress.poBox.toUpperCase();
    }
    return companyProfile;
};

export const formatTitleCase = (str: string | undefined): string => {
    if (!str) {
        return "";
    }

    return str.replace(
        /\w\S*/g, (word) => {
            return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
        });
};

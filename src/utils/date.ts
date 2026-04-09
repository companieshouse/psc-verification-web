import { DateTime } from "luxon";
import { logger } from "../lib/logger";
import { getLocalesService } from "../middleware/localise";

export const toReadableFormat = (dateToConvert: string | undefined, lang = "en"): string => {
    if (!dateToConvert) {
        return "";
    }
    const jsDate = new Date(dateToConvert);
    const dateTime = DateTime.fromJSDate(jsDate, { zone: "UTC" }).setZone("Europe/London");
    const convertedDate = dateTime.setLocale(lang).toFormat("d MMMM yyyy");

    if (convertedDate === "Invalid DateTime") {
        throw logger.info(`Unable to convert provided date ${dateToConvert}`);
    }

    return convertedDate;
};

function getLocalizedMeridiem(dateTime: DateTime, lang: string): string {
    const hour = dateTime.hour;
    let meridiem = hour < 12 ? "am" : "pm";
    if (lang === "cy") {
        meridiem = meridiem === "am" ? "yb" : "yh";
    }
    return meridiem;
}
export const toHourDayDateFormat = (dateToConvert: string | undefined, lang = "en"): string => {
    if (!dateToConvert) {
        return "";
    }
    const jsDate = new Date(dateToConvert);
    const dateTime = DateTime.fromJSDate(jsDate, { zone: "UTC" }).setZone("Europe/London");

    let convertedHour;
    if (dateTime.minute === 0) {
        convertedHour = dateTime.setLocale(lang).toFormat("h").toLowerCase();
    } else {
        convertedHour = dateTime.setLocale(lang).toFormat("h:mm").toLowerCase();
    }
    convertedHour += getLocalizedMeridiem(dateTime, lang);
    const convertedDate = dateTime.setLocale(lang).toFormat("cccc d MMMM yyyy");

    if (convertedHour === "Invalid DateTime" || convertedDate === "Invalid DateTime") {
        throw logger.info(`Unable to convert provided date ${dateToConvert}`);
    }

    const locales = getLocalesService();
    const preposition = locales.i18nCh.resolveSingleKey("service_unavailable_time_preposition", lang);

    return [convertedHour, preposition, convertedDate].join(" ");
};

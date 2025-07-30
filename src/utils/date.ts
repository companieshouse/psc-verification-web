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

export const toHourDayDateFormat = (dateToConvert: string | undefined, lang = "en"): string => {
    if (!dateToConvert) {
        return "";
    }
    const jsDate = new Date(dateToConvert);
    const dateTime = DateTime.fromJSDate(jsDate, { zone: "UTC" }).setZone("Europe/London");

    let convertedHour;
    if (dateTime.minute === 0) {
        convertedHour = dateTime.setLocale(lang).toFormat("ha").toLowerCase();
    } else {
        convertedHour = dateTime.setLocale(lang).toFormat("h:mma").toLowerCase();
    }
    const convertedDate = dateTime.setLocale(lang).toFormat("cccc d MMMM yyyy");

    if (convertedHour === "Invalid DateTime" || convertedDate === "Invalid DateTime") {
        throw logger.info(`Unable to convert provided date ${dateToConvert}`);
    }

    const locales = getLocalesService();
    const preposition = locales.i18nCh.resolveSingleKey("service_unavailable_time_preposition", lang);

    return [convertedHour, preposition, convertedDate].join(" ");
};

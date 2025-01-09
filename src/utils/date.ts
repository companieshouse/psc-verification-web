import { DateTime } from "luxon";
import { logger } from "../lib/logger";
import { getLocalesService } from "./localise";

export const toReadableFormat = (dateToConvert: string | undefined, lang = "en"): string => {
    if (!dateToConvert) {
        return "";
    }
    const jsDate = new Date(dateToConvert);
    const dateTime = DateTime.fromJSDate(jsDate);

    const convertedDate = dateTime.setLocale(lang || "en").toFormat("d MMMM yyyy");

    if (convertedDate === "Invalid DateTime") {
        throw logger.info(`${toReadableFormat.name} - Unable to convert provided date ${dateToConvert}`);
    }

    return convertedDate;
};

export const toHourDayDateFormat = (dateToConvert: string | undefined, lang = "en"): string => {
    if (!dateToConvert) {
        return "";
    }
    const jsDate = new Date(dateToConvert);
    const dateTime = DateTime.fromJSDate(jsDate);

    const convertedHour = dateTime.setLocale(lang || "en").toFormat("h:mma");
    const convertedDate = dateTime.setLocale(lang || "en").toFormat("cccc d MMMM yyyy");

    if (convertedHour === "Invalid DateTime" || convertedDate === "Invalid DateTime") {
        throw logger.info(`${toHourDayDateFormat.name} - Unable to convert provided date ${dateToConvert}`);
    }

    const locales = getLocalesService();
    const proposition = locales.i18nCh.resolveSingleKey("service_unavailable_time_preposition", lang);

    return [convertedHour, proposition, convertedDate].join(" ");
};

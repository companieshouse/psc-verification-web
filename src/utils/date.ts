import { DateTime } from "luxon";
import logger from "../lib/Logger";

export const toReadableFormat = (dateToConvert: string | undefined, lang = "en"): string => {
    if (!dateToConvert) {
        return "";
    }
    const jsDate = new Date(dateToConvert);
    const dateTime = DateTime.fromJSDate(jsDate);
    let convertedDate;

    if (lang) {
        convertedDate = dateTime.setLocale(lang).toFormat("d MMMM yyyy");
      }
    else {
        convertedDate = dateTime.setLocale("en").toFormat("d MMMM yyyy");
    }

    if (convertedDate === "Invalid DateTime") {
        throw logger.info(`Unable to convert provided date ${dateToConvert}`);
    }

    return convertedDate;
};

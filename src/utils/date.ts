import { DateTime } from "luxon";
import { logger } from "../lib/logger";

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

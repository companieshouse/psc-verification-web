import StartRouter from "./../startRouter";
import HealthCheckRouter from "./../healthCheckRouter";
import CompanyNumberRouter from "./../companyNumberRouter";
import ConfirmCompanyRouter from "./../confirmCompanyRouter";
import NewSubmissionRouter from "./../newSubmissionRouter";
import IndividualPscListRouter from "./../individualPscListRouter";
import PscTypeRouter from "./../pscTypeRouter";
import PersonalCodeRouter from "../personalCodeRouter";
import IndividualStatementRouter from "../individualStatementRouter";
import PscVerifiedRouter from "./../pscVerifiedRouter";
import RlePscListRouter from "./../rlePscListRouter";
import StopScreenRouter from "./../stopScreenRouter";

import { logger } from "../../lib/logger";
export { StartRouter, HealthCheckRouter, CompanyNumberRouter, ConfirmCompanyRouter, PscTypeRouter, IndividualPscListRouter, PersonalCodeRouter, IndividualStatementRouter, NewSubmissionRouter, PscVerifiedRouter, RlePscListRouter, StopScreenRouter };

export function formatDateBorn (dateOfBirth: any, lang: string): string {
    try {
        const formattedMonth = Intl.DateTimeFormat(lang, { month: "long" }).format(new Date("" + dateOfBirth?.month));
        const formattedYear = dateOfBirth?.year?.toString() || ""; // Default to an empty string if year is null or undefined
        return `${formattedMonth} ${formattedYear}`;
    } catch (error) {
        logger.error(`${formatDateBorn.name} - Error formatting date: ${error}`);
        return "Invalid date";
    }
}

export function internationaliseDate (date: string, lang: string): string {
    try {
        return Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, { dateStyle: "long" }).format(new Date(date));
    } catch (error) {
        logger.error(`${internationaliseDate.name} - Error internationalising date: ${error}`);
        return "Invalid date";
    }
}

import StartRouter from "./../startRouter";
import HealthCheckRouter from "./../healthCheckRouter";
import CompanyNumberRouter from "./../companyNumberRouter";
import ConfirmCompanyRouter from "./../confirmCompanyRouter";
import NewSubmissionRouter from "./../newSubmissionRouter";
import IndividualPscListRouter from "./../individualPscListRouter";
import PersonalCodeRouter from "../personalCodeRouter";
import IndividualStatementRouter from "../individualStatementRouter";
import PscVerifiedRouter from "./../pscVerifiedRouter";
import StopScreenRouter from "./../stopScreenRouter";
import NameMismatchRouter from "../nameMismatchRouter";

import { logger } from "../../lib/logger";
import { Headers } from "@companieshouse/api-sdk-node/dist/http";
export { StartRouter, HealthCheckRouter, CompanyNumberRouter, ConfirmCompanyRouter, IndividualPscListRouter, NameMismatchRouter, PersonalCodeRouter, IndividualStatementRouter, NewSubmissionRouter, PscVerifiedRouter, StopScreenRouter };

export function formatDateBorn (dateOfBirth: any, lang: string): string {
    try {
        const formattedMonth = Intl.DateTimeFormat(lang, { month: "long" }).format(new Date("" + dateOfBirth?.month));
        const formattedYear = dateOfBirth?.year?.toString() ?? ""; // Default to an empty string if year is null or undefined
        return `${formattedMonth} ${formattedYear}`;
    } catch (error) {
        logger.error(`Error formatting date: ${error}`);
        return "Invalid date";
    }
}

export function internationaliseDate (date: string, lang: string): string {
    try {
        return Intl.DateTimeFormat(lang === "en" ? "en-GB" : lang, { dateStyle: "long" }).format(new Date(date));
    } catch (error) {
        logger.error(`Error internationalising date: ${error}`);
        return "Invalid date";
    }
}

export function extractRequestIdHeader (req: any): Headers {
    const requestId = req.headers?.["x-request-id"] ?? null;
    if (requestId) {
        return { "X-Request-Id": requestId };
    } else {
        return {};
    }
}

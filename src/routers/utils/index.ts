import StartRouter from "./../startRouter";
import AccessibilityStatementRouter from "./../accessibilityStatementRouter";
import HealthCheckRouter from "./../healthCheckRouter";
import CompanyNumberRouter from "./../companyNumberRouter";
import ConfirmCompanyRouter from "./../confirmCompanyRouter";
import NewSubmissionRouter from "./../newSubmissionRouter";
import IndividualPscListRouter from "./../individualPscListRouter";
import PersonalCodeRouter from "../personalCodeRouter";
import IndividualStatementRouter from "../individualStatementRouter";
import CloseTransactionRouter from "./../closeTransactionRouter";
import PscVerifiedRouter from "./../pscVerifiedRouter";
import StopScreenRouter from "./../stopScreenRouter";
import NameMismatchRouter from "../nameMismatchRouter";

import { logger } from "../../lib/logger";
import { Headers } from "@companieshouse/api-sdk-node/dist/http";
import { createHmac } from "crypto";
export { StartRouter, AccessibilityStatementRouter, HealthCheckRouter, CloseTransactionRouter, CompanyNumberRouter, ConfirmCompanyRouter, IndividualPscListRouter, NameMismatchRouter, PersonalCodeRouter, IndividualStatementRouter, NewSubmissionRouter, PscVerifiedRouter, StopScreenRouter };

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

interface GetPresenterRedirectParams {
    companyNumber: string;
    formType: string;
    transactionId: string;
    returnUrl: string;
    lang: string;
}

export function getPresenterJourneyUrl (params: GetPresenterRedirectParams): string {
    const url = new URL(`${process.env.CHS_URL}/transaction/${params.transactionId}/presenter`);
    url.searchParams.append("jwt", signPresenterJourneyJwt(params));

    return url.toString();
}

function base64UrlEncode (input: string | Buffer): string {
    return Buffer.from(input).toString("base64")
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
}

function signPresenterJourneyJwt (params: GetPresenterRedirectParams): string {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
        companyNumber: params.companyNumber,
        formType: params.formType,
        returnUrl: params.returnUrl,
        lang: params.lang
    };

    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signature = base64UrlEncode(
        createHmac("sha256", process.env.CHS_JWT_SECRET as string)
            .update(signingInput)
            .digest()
    );

    return `${signingInput}.${signature}`;
}

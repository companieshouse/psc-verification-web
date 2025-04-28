import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { PSC_VERIFICATION_WEB_NAMESPACE } from "./constants";
import { env } from "../config";
import { HttpError } from "./errors/httpError";
import { HttpStatusCode } from "axios";

export const logger: ApplicationLogger = createLogger(env.APP_NAME ?? PSC_VERIFICATION_WEB_NAMESPACE);

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${env.LOG_LEVEL}`);

export const createAndLogError = (description: string): Error => {
    const error = new Error(description);
    logger.error(`${error.stack}`);
    return error;
};

export const createAndLogHttpError = (description: string, statusCode: number | HttpStatusCode): HttpError => {
    const error = new HttpError(description, statusCode);
    logger.error(`${error.status} - ${error.stack}`);
    return error;
};

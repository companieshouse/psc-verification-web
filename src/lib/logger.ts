import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { PSC_VERIFICATION_WEB_NAMESPACE } from "./constants";
import { env } from "../config";

export const logger: ApplicationLogger = createLogger(env.APP_NAME ?? PSC_VERIFICATION_WEB_NAMESPACE);

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${env.LOG_LEVEL}`);

// TODO: deprecate this in favour of logging in httpErrorInterceptor?
export const createAndLogError = (description: string): Error => {
    const error = new Error(description);
    logger.error(`${error.stack}`);
    return error;
};

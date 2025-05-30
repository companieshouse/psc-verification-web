import { createLogger } from "@companieshouse/structured-logging-node";
import ApplicationLogger from "@companieshouse/structured-logging-node/lib/ApplicationLogger";
import { PSC_VERIFICATION_WEB_NAMESPACE } from "./constants";
import { env } from "../config";
import { Request } from "express";

// tslint:disable-next-line:no-console
console.log(`env.LOG_LEVEL set to ${env.LOG_LEVEL}`);

export interface LogPrefixOptions {
    stackPos?: number;
    error?: Error;
}

export class PrefixedLogger {
    readonly raw: ApplicationLogger;

    constructor () {
        this.raw = createLogger(env.APP_NAME ?? PSC_VERIFICATION_WEB_NAMESPACE);
    }

    info (message: string) {
        this.raw.info(`${this.getPrefix()} ${message}`);
    }

    error (message: string) {
        this.raw.error(`${this.getPrefix()} ${message}`);
    }

    debug (message: string) {
        this.raw.debug(`${this.getPrefix()} ${message}`);
    }

    trace (message: string) {
        this.raw.trace(`${this.getPrefix()} ${message}`);
    }

    infoRequest (req: Request, message: string) {
        this.raw.infoRequest(req, `${this.getPrefix()} ${message}`);
    }

    errorRequest (req: Request, message: string) {
        this.raw.errorRequest(req, `${this.getPrefix()} ${message}`);
    }

    debugRequest (req: Request, message: string) {
        this.raw.debugRequest(req, `${this.getPrefix()} ${message}`);
    }

    traceRequest (req: Request, message: string) {
        this.raw.traceRequest(req, `${this.getPrefix()} ${message}`);
    }

    /**
     * Extracts context from the stack trace to provide a prefix for log messages.
     *
     * @returns {string} The prefix for the log context in the format "ClassName::methodName -".
     */
    public getPrefix (options: LogPrefixOptions = {}): string {
        // Default stack position is 3 unless specified:
        // - 0: the error
        // - 1: this.getPrefix() call
        // - 2: PrefixedLogger.getPrefix() call
        // - 3: The actual method that called for the logger
        let { stackPos = 3, error } = options;

        // If no error is provided, create a new Error to capture the stack trace
        if (!error) {
            error = new Error();
        } else {
            stackPos -= 2; // Adjust stack position if an error is provided
        }
        const stack = error.stack?.split("\n");

        // If the stack trace is not available or does not have enough lines, log an error and return an empty string
        if (!stack || stack.length <= stackPos) {
            this.raw.error(`${this.getPrefix.name} - unable to extract log prefix from stack trace: ${error.stack}`);
            return "";
        }

        // There are two possible formats for the stack lines:
        //  A: class, method, filepath ~ "    at ClassName.methodName (path/to/file.ts:line:col)"
        //  B: just filepath           ~ "    at /path/to/file.ts:line:col"

        // Format A (class/method)
        const classMethodRegex = /at\s+(.*)\s+\(/;
        const classMethodMatch = classMethodRegex.exec(stack[stackPos]);
        if (classMethodMatch?.[1]) {
            const prefix = classMethodMatch[1].replace(".", "::");
            return prefix + " -"; // "ClassName::methodName -"
        }

        // Format B (filepath)
        const filePathRegex = /at\s+([^\s]+)/;
        const filePathMatch = filePathRegex.exec(stack[stackPos]);
        if (filePathMatch?.[1]) {
            const prefix = filePathMatch[1].split("/").pop()?.split(".")[0];
            return prefix + " -"; // "fileName -"
        }

        this.raw.error(`${this.getPrefix.name} - unable to extract log prefix from stack trace: ${error.stack}`);
        return "";
    }
}

export const logger = new PrefixedLogger();

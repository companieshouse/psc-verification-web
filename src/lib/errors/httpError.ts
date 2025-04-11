import { HttpStatusCode } from "axios";

export class HttpError extends Error {
    public status: number;

    constructor (message: string, status: number | HttpStatusCode) {
        super(message);
        this.name = "HttpError";
        this.status = status;

        // Maintains stack trace for where the error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, HttpError);
        }
    }
}

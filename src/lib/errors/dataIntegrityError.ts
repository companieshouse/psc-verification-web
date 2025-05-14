
export enum DataIntegrityErrorType {
    PSC_DATA = "PSC_DATA",
}

export class DataIntegrityError extends Error {
    public type: DataIntegrityErrorType;

    constructor (message: string, type: DataIntegrityErrorType) {
        super(message);
        this.name = "DataIntegrityError";
        this.type = type;

        // Maintains stack trace for where the error was thrown
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, DataIntegrityError);
        }
    }
}

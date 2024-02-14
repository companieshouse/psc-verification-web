// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers

import { ExternalUrls, PrefixedUrls, servicePathPrefix } from "../../constants";
import errorManifest from "../../lib/utils/error_manifests/default";
import { Request } from "express";

export interface BaseViewData {
    errors: any
    title: string
    isSignedIn: boolean
    backURL: string | null
    servicePathPrefix: string
    Urls: typeof PrefixedUrls
    ExternalUrls: typeof ExternalUrls
    userEmail: string | null
}

export const defaultBaseViewData: Partial<BaseViewData> = {
    errors: {},
    isSignedIn: false,
    backURL: null,
    servicePathPrefix: servicePathPrefix,
    Urls: PrefixedUrls,
    ExternalUrls: ExternalUrls,
    userEmail: null,
    title: "Apply to file with Companies House using software"
} as const;

export interface Redirect {
    redirect: string
}

export abstract class GenericHandler<T extends BaseViewData> {
    protected errorManifest: typeof errorManifest;
    private viewData: T;

    constructor () {
        this.errorManifest = errorManifest;
        this.viewData = defaultBaseViewData as T;
    }

    processHandlerException (err: any): Object {
        if (err.name === "VALIDATION_ERRORS") {
            return err.stack;
        }
        return {
            serverError: this.errorManifest.generic.serverError
        };
    }

    populateViewData (req: Request) {
        // Populate when we have a session
    }

    getViewData (req: Request): T {
        this.populateViewData(req);
        return this.viewData;
    }
}

export interface ViewModel<T> {
    templatePath: string,
    viewData: T
}

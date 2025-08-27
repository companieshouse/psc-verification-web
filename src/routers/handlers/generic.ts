// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers

import { Request, Response } from "express";
import { ExternalUrls, PrefixedUrls, servicePathPrefix } from "../../constants";
import errorManifest from "../../lib/utils/error-manifests/errorManifest";

export interface BaseViewData {
    errors: any
    title: string
    backURL: string | null
    servicePathPrefix: string
    Urls: typeof PrefixedUrls
    ExternalUrls: typeof ExternalUrls
    currentUrl: string | null
    hideNavbar: boolean
    templateName: string | null
}

export const defaultBaseViewData: Partial<BaseViewData> = {
    errors: {},
    backURL: null,
    servicePathPrefix,
    Urls: PrefixedUrls,
    ExternalUrls,
    currentUrl: null,
    hideNavbar: false,
    title: "Apply to file with Companies House using software",
    templateName: null
} as const;

export async function getViewData<T extends BaseViewData> (req: Request, res: Response): Promise<T> {
    const viewData = defaultBaseViewData as T;
    return viewData;
}

export abstract class GenericHandler<T extends BaseViewData> {
    protected errorManifest!: ReturnType<typeof errorManifest>;
    private viewData!: T;

    async getViewData (req: Request, res: Response, lang: string = "en"): Promise<T> {
        this.errorManifest = errorManifest(lang);
        this.viewData = await getViewData<T>(req, res);
        return this.viewData;
    }

    processHandlerException (err: any): Object {
        if (err.name === "VALIDATION_ERRORS") {
            return err.stack;
        }
        throw err;
    }
}

export interface ViewModel<T> {
    templatePath: string,
    viewData: T
}

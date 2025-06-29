// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers

import { Request, Response } from "express";
import { ExternalUrls, PrefixedUrls, servicePathPrefix } from "../../constants";
import errorManifest from "../../lib/utils/error-manifests/errorManifest";

export interface BaseViewData {
    errors: any
    title: string
    isSignedIn: boolean
    backURL: string | null
    servicePathPrefix: string
    Urls: typeof PrefixedUrls
    ExternalUrls: typeof ExternalUrls
    userEmail: string | null
    currentUrl: string | null
    templateName: string | null
}

export const defaultBaseViewData: Partial<BaseViewData> = {
    errors: {},
    isSignedIn: false,
    backURL: null,
    servicePathPrefix,
    Urls: PrefixedUrls,
    ExternalUrls,
    currentUrl: null,
    userEmail: null,
    title: "Apply to file with Companies House using software",
    templateName: null
} as const;

export interface Redirect {
    redirect: string
}

export abstract class GenericHandler<T extends BaseViewData> {
    protected errorManifest!: ReturnType<typeof errorManifest>;
    private viewData!: T;

    processHandlerException (err: any): Object {
        if (err.name === "VALIDATION_ERRORS") {
            return err.stack;
        }

        throw err;
    }

    populateViewData (req: Request, res: Response) {
        const { signin_info: signInInfo } = req.session?.data ?? {};
        const isSignedIn = signInInfo?.signed_in !== undefined;
        this.viewData.isSignedIn = isSignedIn;

        if (!isSignedIn) { return; }

        const userEmail = signInInfo?.user_profile?.email;
        if (!userEmail) {
            throw new Error("GenericHandler unable to get email. Email is undefined.");
        }

        this.viewData.userEmail = userEmail;
    }

    async getViewData (req: Request, res: Response, lang: string = "en"): Promise<T> {
        this.errorManifest = errorManifest(lang);
        this.viewData = defaultBaseViewData as T;
        this.populateViewData(req, res);
        return this.viewData;
    }
}

export interface ViewModel<T> {
    templatePath: string,
    viewData: T
}

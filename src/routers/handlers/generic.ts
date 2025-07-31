// Generic handler is the base handler that is extended by all other handlers
// It contains methods that are common to multiple route handlers

import { Request, Response } from "express";
import { ExternalUrls, PrefixedUrls, servicePathPrefix } from "../../constants";
import errorManifest from "../../lib/utils/error-manifests/errorManifest";
import { logger } from "../../lib/logger";

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

export function populateViewData<T extends BaseViewData> (viewData: T, req: Request, res: Response): void {
    const { signin_info: signInInfo } = req.session?.data ?? {};
    const isSignedIn = signInInfo?.signed_in !== undefined;
    viewData.isSignedIn = isSignedIn;

    if (!isSignedIn) { return; }

    const userEmail = signInInfo?.user_profile?.email;
    if (userEmail) {
        viewData.userEmail = userEmail;
    } else {
        logger.error("GenericHandler unable to get email. Email is undefined.");
        viewData.userEmail = ""; // Blank email to avoid a scenario where the email is undefined
    }
}

export async function getViewData<T extends BaseViewData> (req: Request, res: Response): Promise<T> {
    const viewData = defaultBaseViewData as T;
    populateViewData(viewData, req, res);
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

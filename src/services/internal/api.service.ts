import { Session } from "@companieshouse/node-session-handler";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import logger from "../../lib/Logger";
import { createApiClient } from "@companieshouse/api-sdk-node";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { env } from "../../config";

export const createPublicOAuthApiClient = (session: Session): ApiClient => {
    const oAuth = session.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];
    if (oAuth) {
        return createApiClient(undefined, oAuth, env.API_URL);
    }
    throw logger.error("Error getting session keys for creating public api client");
};

export const createPublicApiKeyClient = (): ApiClient => {
    return createApiClient(env.CHS_API_KEY, undefined, env.API_URL);
};

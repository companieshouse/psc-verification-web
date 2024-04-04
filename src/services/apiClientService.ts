import { Session } from "@companieshouse/node-session-handler";
import ApiClient from "@companieshouse/api-sdk-node/dist/client";
import { createApiClient } from "@companieshouse/api-sdk-node";

import { env } from "../config";
import { getAccessToken } from "../utils/session";

export const createOAuthApiClient = (session: Session | undefined, baseUrl: string = env.API_URL): ApiClient => {
    return createApiClient(undefined, getAccessToken(session as Session), baseUrl);
};

export const createApiKeyClient = (): ApiClient => {
    return createApiClient(env.CHS_API_KEY, undefined, env.API_URL);
};

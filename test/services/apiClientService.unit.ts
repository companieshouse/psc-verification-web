import { createApiClient } from "@companieshouse/api-sdk-node";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { createApiKeyClient, createOAuthApiClient } from "../../src/services/apiClientService";
import { getSignedInSessionRequest } from "../mocks/session.mock";

jest.mock("@companieshouse/api-sdk-node");
jest.mock("@companieshouse/api-sdk-node/dist/client");
jest.mock("@companieshouse/node-session-handler");

describe("createOAuthApiClient", () => {
    const session = getSignedInSessionRequest();
    const token = session?.data?.[SessionKey.SignInInfo]?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken];

    it("should return new API client for signed in user's OAuth token", () => {
        const client = createOAuthApiClient(session);

        expect(client).not.toBeNull();
        expect(createApiClient).toHaveBeenCalledWith(undefined, token, process.env.API_URL);
    });

    it("should return new API client for signed in user's OAuth token and specific URL", () => {
        const client = createOAuthApiClient(session, process.env.API_URL);

        expect(client).not.toBeNull();
        expect(createApiClient).toHaveBeenCalledWith(undefined, token, process.env.API_URL);
    });

});

describe("createApiKeyClient", () => {
    it("should return new API client for API key", () => {
        const client = createApiKeyClient();

        expect(client).not.toBeNull();
        expect(createApiClient).toHaveBeenCalledWith(process.env.CHS_INTERNAL_API_KEY, undefined, process.env.API_URL);
    });

});

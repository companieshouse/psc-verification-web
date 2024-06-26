import { Session } from "@companieshouse/node-session-handler";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";

export function getSignInInfo (session: Session): ISignInInfo | undefined {
    return session?.data?.[SessionKey.SignInInfo];
}

export function getAccessToken (session: Session): string {
    const signInInfo = getSignInInfo(session);
    return signInInfo?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken] as string;
}

export const checkUserSignedIn = (session: Session): boolean => {
    const signInInfo = getSignInInfo(session);
    return signInInfo?.[SignInInfoKeys.SignedIn] === 1;
};

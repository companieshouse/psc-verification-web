import { SessionKey } from "@companieshouse/node-session-handler/lib/session/keys/SessionKey";
import { SignInInfoKeys } from "@companieshouse/node-session-handler/lib/session/keys/SignInInfoKeys";
import { UserProfileKeys } from "@companieshouse/node-session-handler//lib/session/keys/UserProfileKeys";
import { ISignInInfo } from "@companieshouse/node-session-handler/lib/session/model/SessionInterfaces";
import { AccessTokenKeys } from "@companieshouse/node-session-handler/lib/session/keys/AccessTokenKeys";
import { Session } from "@companieshouse/node-session-handler";

const getSignInInfo = (session: Session): ISignInInfo => {
    return session?.data?.[SessionKey.SignInInfo] as ISignInInfo;
};

export const getLoggedInUserEmail = (session: Session): string => {
    const signInInfo = getSignInInfo(session);
    return signInInfo?.[SignInInfoKeys.UserProfile]?.[UserProfileKeys.Email] as string;
};

export const checkUserSignedIn = (session: Session): boolean => {
    const signInInfo = getSignInInfo(session);
    return signInInfo?.[SignInInfoKeys.SignedIn] === 1;
};

export const getRefreshToken = (session: Session): string => {
    const signInInfo = getSignInInfo(session);
    return signInInfo?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.RefreshToken] as string;
};

export const getAccessToken = (session: Session): string => {
    const signInInfo = getSignInInfo(session);
    return signInInfo?.[SignInInfoKeys.AccessToken]?.[AccessTokenKeys.AccessToken] as string;
};

export const setAccessToken = (session: Session, accessToken: SignInInfoKeys) => {
    const signInInfo = getSignInInfo(session);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  signInInfo[SignInInfoKeys.AccessToken]![AccessTokenKeys.AccessToken] = accessToken;
};

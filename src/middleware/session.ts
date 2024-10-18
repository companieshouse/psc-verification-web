import { SessionMiddleware, SessionStore } from "@companieshouse/node-session-handler";
import Redis from "ioredis";
import { env } from "../config";

const redis = new Redis(env.CACHE_SERVER);
export const sessionStore = new SessionStore(redis);

export const sessionMiddleware = SessionMiddleware({
    cookieDomain: env.COOKIE_DOMAIN,
    cookieName: env.COOKIE_NAME,
    cookieSecret: env.COOKIE_SECRET,
    cookieSecureFlag: undefined,
    cookieTimeToLiveInSeconds: parseInt(env.DEFAULT_SESSION_EXPIRATION, 10)
}, sessionStore, true);

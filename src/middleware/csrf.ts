import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { sessionStore } from "./session";
import { env } from "../config";

export const csrfProtectionMiddleware = CsrfProtectionMiddleware({
    sessionStore,
    enabled: false,
    sessionCookieName: env.COOKIE_NAME
});

console.log(env.COOKIE_NAME);
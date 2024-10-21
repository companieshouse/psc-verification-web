import { CsrfProtectionMiddleware } from "@companieshouse/web-security-node";
import { sessionStore } from "./session";
import { env } from "../config";

export const csrfProtectionMiddleware = CsrfProtectionMiddleware({
    sessionStore,
    enabled: true,
    sessionCookieName: env.COOKIE_NAME
});

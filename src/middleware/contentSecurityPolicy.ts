import { RequestHandler } from "express";
import helmet, { HelmetOptions } from "helmet";
import { env } from "../config";
import { v4 as uuidv4 } from "uuid";

const prepareCSPConfig = (nonce: string): HelmetOptions => {
    const CDN = env.CDN_HOST.replace(/^\/\//, "");
    const PIWIK_URL = env.PIWIK_URL;
    const PIWIK_CHS_DOMAIN = "*." + env.COOKIE_DOMAIN;
    const SELF = "'self'";
    const NONCE = `'nonce-${nonce}'`;
    const ONE_YEAR_SECONDS = 31536000;
    const CHS_URL = env.CHS_URL;
    const HTTP_CHS_URL: string = CHS_URL.replace(/^https:\/\//, "http://");
    const DS_SCRIPT_HASH = "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='";

    return {
        contentSecurityPolicy: {
            directives: {
                upgradeInsecureRequests: null,
                defaultSrc: [SELF],
                fontSrc: [CDN],
                imgSrc: [CDN, PIWIK_URL],
                styleSrc: [NONCE, CDN],
                connectSrc: [SELF, PIWIK_URL, CDN, CHS_URL],
                formAction: [
                    SELF,
                    PIWIK_CHS_DOMAIN,
                    "https://*.gov.uk",
                    CHS_URL,
                    HTTP_CHS_URL
                ],
                scriptSrc: [
                    NONCE,
                    CDN,
                    PIWIK_URL,
                    DS_SCRIPT_HASH
                ],
                manifestSrc: [CDN],
                objectSrc: ["'none'"]
            }
        },
        crossOriginOpenerPolicy: { policy: "same-origin" },
        originAgentCluster: true,
        referrerPolicy: {
            policy: ["same-origin"]
        },
        hsts: {
            maxAge: ONE_YEAR_SECONDS,
            includeSubDomains: true
        }
    };
};

export const cspMiddleware: RequestHandler = (req, res, next) => {
    const nonce = uuidv4();
    const cspConfig = prepareCSPConfig(nonce);
    res.locals.nonce = nonce;
    res.locals.cspNonce = nonce;
    helmet(cspConfig)(req, res, next);
};

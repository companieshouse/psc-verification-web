import cookieParser from "cookie-parser";
import express, { NextFunction, Request, Response } from "express";
import nunjucks from "nunjucks";
import path from "path";
import { ExternalUrls, servicePathPrefix } from "./constants";
import { logger } from "./lib/logger";
import { sessionMiddleware } from "./middleware/session";
import routerDispatch from "./routerDispatch";
import { isLive } from "./middleware/serviceLive";
import { csrfProtectionMiddleware } from "./middleware/csrf";
import csrfErrorHandler from "./middleware/csrfError";
import { pageNotFound } from "./middleware/pageNotFound";

const app = express();

// service availability page
app.use(isLive);

app.set("views", [
    path.join(__dirname, "views"),
    path.join(__dirname, "../node_modules/govuk-frontend"), // This if for when using ts-node since the working directory is src
    path.join(__dirname, "node_modules/govuk-frontend"),
    path.join(__dirname, "../node_modules/@companieshouse/ch-node-utils/templates/"),
    path.join(__dirname, "node_modules/@companieshouse/ch-node-utils/templates/"),
    path.join(__dirname, "../node_modules/@companieshouse/web-security-node/components"),
    path.join(__dirname, "node_modules/@companieshouse/web-security-node/components")
]);

const nunjucksLoaderOpts = {
    watch: process.env.NUNJUCKS_LOADER_WATCH !== "false",
    noCache: process.env.NUNJUCKS_LOADER_NO_CACHE !== "true"
};

const njk = new nunjucks.Environment(
    new nunjucks.FileSystemLoader(app.get("views"),
        nunjucksLoaderOpts)
);

njk.express(app);
app.set("view engine", "njk");

// get cookie data from incoming request
app.use(cookieParser());

// parse incoming payload into req.body
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// initiate session and attach to middleware
app.use(servicePathPrefix, sessionMiddleware);

// attach csrf protection to middleware
app.use(csrfProtectionMiddleware);
app.use(csrfErrorHandler);

// serve static files
app.use(express.static(path.join(__dirname, "./../assets/public")));

njk.addGlobal("cdnUrlCss", process.env.CDN_URL_CSS);
njk.addGlobal("cdnUrlJs", process.env.CDN_URL_JS);
njk.addGlobal("cdnHost", process.env.CDN_HOST);
njk.addGlobal("chsUrl", process.env.CHS_URL);
njk.addGlobal("ExternalUrls", ExternalUrls);
njk.addGlobal("PIWIK_SERVICE_NAME", process.env.PIWIK_SERVICE_NAME);
njk.addGlobal("PIWIK_START_GOAL_ID", process.env.PIWIK_START_GOAL_ID);
njk.addGlobal("PIWIK_SITE_ID", process.env.PIWIK_SITE_ID);
njk.addGlobal("PIWIK_URL", process.env.PIWIK_URL);
njk.addGlobal("verifyIdentityLink", process.env.VERIFY_IDENTITY_LINK);

// if app is behind a front-facing proxy, and to use the X-Forwarded-* headers to determine the connection and the IP address of the client
app.enable("trust proxy");

// channel all requests through router dispatch
routerDispatch(app);

// 404 - page not found error
app.use(pageNotFound);

// unhandled errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`${err.name} - appError: ${err.message} - ${err.stack}`);
    res.render("partials/error_500");
});

// unhandled exceptions
process.on("uncaughtException", (err: any) => {
    logger.error(`${err.name} - uncaughtException: ${err.message} - ${err.stack}`);
    process.exit(1);
});

// unhandled promise rejections
process.on("unhandledRejection", (err: any) => {
    logger.error(`${err.name} - unhandledRejection: ${err.message} - ${err.stack}`);
    process.exit(1);
});

export default app;

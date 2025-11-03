import { Validators, addProtocolIfMissing, readEnv } from "./validator";

const { str, url, bool, port } = Validators;

export const env = readEnv(process.env, {
    ACCOUNT_URL: str.describe("Host URL for the account service"),
    API_URL: str.describe("API base URL for service interaction"),
    APP_NAME: str.describe("Name of the application"),
    CACHE_SERVER: str.describe("Name of the server cache"),
    CDN_HOST: str.map(addProtocolIfMissing).describe("URL for the CDN"),
    CDN_URL_CSS: str.describe("CDN URL for the CSS files"),
    CDN_URL_JS: str.describe("CDN URL for the JavaScript files"),
    CH_NODE_UTILS_LOG_LVL: str.describe("Enable the logging within ch-node-utils for localisation"),
    CHS_INTERNAL_API_KEY: str.describe("Internal API key"),
    CHS_URL: url.describe("This host URL for CHS"),
    CONTACT_US_LINK: str.describe("Link to contact us"),
    COOKIE_DOMAIN: str.describe("Domain for cookies"),
    COOKIE_NAME: str.describe("Name for the cookie"),
    COOKIE_SECRET: str.describe("Secret used for cookie encryption"),
    DEFAULT_SESSION_EXPIRATION: str,
    DSR_EMAIL_ADDRESS: str.describe("Email Address for DSR team"),
    DSR_PHONE_NUMBER: str.describe("Telephone number for the DSR team"),
    ENQUIRIES_EMAIL_ADDRESS: str.describe("Email Address for enquiries"),
    ENQUIRIES_PHONE_NUMBER: str.describe("Telephone number for enquiries"),
    GET_PSC01_LINK: url.describe("Link to obtaining paper form PSC01"),
    GET_RP01_LINK: url.describe("Link to obtaining paper form RP01"),
    IDV_IMPLEMENTATION_DATE: str.describe("Date when IDV comes into effect for PSCs"),
    LOCALES_ENABLED: str.describe("feature flag that toggles localisation behaviour"),
    LOCALES_PATH: str.describe("The name of the directory where the locales files are stored"),
    LOG_LEVEL: str
        .in([
            "ALL",
            "TRACE",
            "DEBUG",
            "INFO",
            "WARN",
            "ERROR",
            "FATAL",
            "MARK",
            "OFF",
            "all",
            "trace",
            "debug",
            "info",
            "warn",
            "error",
            "fatal",
            "mark",
            "off"
        ])
        .describe(
            "Defines the level of events to be logged. Options are: " +
                "ALL/all (all events will be logged), " +
                "TRACE/trace (trace level events will be logged), " +
                "DEBUG/debug (debug level events will be logged), " +
                "INFO/info (information level events will be logged), " +
                "WARN/warn (warnings will be logged), " +
                "ERROR/error (errors will be logged), " +
                "FATAL/fatal (only fatal errors will be logged), " +
                "MARK/mark (used for particular important log events), " +
                "OFF/off (no events will be logged). " +
                "The order from least to most severe is: ALL < TRACE < DEBUG < INFO < WARN < ERROR < FATAL < MARK < OFF. " +
                "OFF is intended to be used to turn off logging, not as a level for actual logging."
        ),
    NODE_HOSTNAME: str.describe("Host name the server is hosted on"),
    NODE_HOSTNAME_SECURE: str.describe("Hostname for the secure HTTPS server"),
    NODE_SSL_CERTIFICATE: str.describe("Path to the SSL certificate file").default(""),
    NODE_SSL_ENABLED: str.describe("Flag to enable SSL for the server"),
    NODE_SSL_PRIVATE_KEY: str.describe("Path to the SSL private key file").default(""),
    NUNJUCKS_LOADER_NO_CACHE: bool.describe("Flag to control the caching of templates in the Nunjucks loader"),
    NUNJUCKS_LOADER_WATCH: bool.describe("Flag to enable or disable watching for file changes in the Nunjucks loader"),
    PIWIK_SERVICE_NAME: str.describe("Service name used by Matomo scripts"),
    PIWIK_URL: str.describe("Link to the matomo dashboard"),
    PIWIK_SITE_ID: str.describe("Matomo Site Id represents the environment"),
    PIWIK_START_GOAL_ID: str.describe("Goal Id for the start button - used by matomo"),
    PIWIK_VERIFY_GOAL_ID: str.describe("Goal Id for the \"Provide verification details\" button - used by matomo"),
    PIWIK_REQUEST_EXTENSION_GOAL_ID: str.describe("Goal Id for the \"Request extension\" button - used by matomo"),
    PSC_EXTENSIONS_PATH: str.describe("Path to build the PSC_EXTENSIONS link"),
    PSC_DATA_API_FETCH_SIZE: str.describe("Number of records fetched from the PSC data API in a single request"),
    POST_TO_CH_LINK: url.describe("Link to guidance on submission by post"),
    SERVICE_LIVE: str.describe("Prevent use of service until Implementation"),
    VERIFY_IDENTITY_LINK: str.describe("Path to guidance to Verify Identity"),
    WEBFILING_LOGIN_URL: url.describe("URL for Webfiling login page")
});

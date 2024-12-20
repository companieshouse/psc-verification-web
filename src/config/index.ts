import { Validators, addProtocolIfMissing, readEnv } from "./validator";

const { str, url, bool, port } = Validators;

export const env = readEnv(process.env, {
    ABILITY_NET_LINK: url.default("https://mcmw.abilitynet.org.uk/"),
    API_URL: str
        .describe("API base URL for service interaction"),
    APP_NAME: str
        .describe("Name of the application")
        .default("psc-verification-web"),
    APPLICATION_FORM_LINK: str
        .default(
            "https://www.gov.uk/government/publications/apply-for-a-companies-house-online-filing-presenter-account"
        )
        .describe("Link to complete an application form"),
    CACHE_SERVER: str
        .default("redis"),
    CDN_HOST: str.map(addProtocolIfMissing).describe("URL for the CDN"),
    CDN_URL_CSS: str.describe("CDN URL for the CSS files").default("/css"),
    CDN_URL_JS: str.describe("CDN URL for the JavaScript files").default("/js"),
    CH_NODE_UTILS_LOG_LVL: str
        .describe("Enable the logging within ch-node-utils for localisation")
        .default("INFO"),
    CHS_API_KEY: str
        .describe("API key for CHS service"),
    CHS_URL: url.describe("This host URL for CHS"),
    CONTACT_US_LINK: str
        .describe("Link to contact us")
        .default(
            "https://www.gov.uk/government/organisations/companies-house#org-contacts"
        ),
    COOKIE_DOMAIN: str.describe("Domain for cookies"),
    COOKIE_NAME: str
        .describe("Name for the cookie")
        .default("__SID"),
    COOKIE_SECRET: str.describe("Secret used for cookie encryption"),
    DEFAULT_SESSION_EXPIRATION: str
        .default("3600"),
    DEVELOPERS_LINK: str
        .describe("Link for developers")
        .default("https://developer.companieshouse.gov.uk/"),
    DSR_EMAIL_ADDRESS: str
        .describe("Email Address for DSR team")
        .default("dsr@companieshouse.gov.uk"),
    DSR_PHONE_NUMBER: str
        .describe("Telephone number for the DSR team")
        .default("02921 507 370"),
    FEEDBACK_URL: str
        .describe("Link for the user to give feedback on the service")
        .default(""),
    GET_PSC01_LINK: url
        .describe("Link to obtaining paper form PSC01")
        .default("https://www.gov.uk/government/publications/give-notice-of-individual-person-with-significant-control-psc01"),
    GET_RP01_LINK: url
        .describe("Link to obtaining paper form RP01")
        .default("https://www.gov.uk/government/publications/replace-a-document-not-meeting-requirements-rp01"),
    IDV_IMPLEMENTATION_DATE: str
        .describe("Date when IDV comes into effect for PSCs")
        .default(""),
    LOCALES_ENABLED: str
        .describe("feature flag that toggles localisation behaviour")
        .default("false"),
    LOCALES_PATH: str
        .describe("The name of the directory where the locales files are stored")
        .default("locales"),
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
        )
        .default("info"),
    NODE_HOSTNAME: str
        .describe("Host name the server is hosted on")
        .default(""),
    NODE_HOSTNAME_SECURE: str
        .describe("Hostname for the secure HTTPS server")
        .default("localhost"),
    NODE_PORT_SSL: port.describe("Port for the HTTPS server").default(3001),
    NODE_SSL_CERTIFICATE: str
        .describe("Path to the SSL certificate file")
        .default(""),
    NODE_SSL_ENABLED: str
        .describe("Flag to enable SSL for the server")
        .default(false),
    NODE_SSL_PRIVATE_KEY: str
        .describe("Path to the SSL private key file")
        .default(""),
    NUNJUCKS_LOADER_NO_CACHE: bool
        .describe(
            "Flag to control the caching of templates in the Nunjucks loader"
        )
        .default(false),
    NUNJUCKS_LOADER_WATCH: bool
        .describe(
            "Flag to enable or disable watching for file changes in the Nunjucks loader"
        )
        .default(false),
    OPEN_GOVERNMENT_LICENSE_LINK: str
        .describe("Link to the open government license")
        .default(
            "https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
        ),
    PIWIK_SERVICE_NAME: str
        .describe("Service name used by Matomo scripts")
        .default("psc-verified"),
    PIWIK_URL: str
        .describe("Link to the matomo dashboard")
        .default("https://matomo.platform.aws.chdev.org"),
    PIWIK_SITE_ID: str
        .describe("Matomo Site Id represents the environment")
        .default(""),
    PIWIK_START_GOAL_ID: str
        .describe("Goal Id for the start button used by matomo")
        .default("24"),
    POLICIES_LINK: str
        .describe("Link to policies")
        .default("https://resources.companieshouse.gov.uk/legal/termsAndConditions.shtml"),
    PORT: port.describe("Port to run the web server on").default(3000),
    POST_TO_CH_LINK: url
        .describe("Link to guidance on submission by post")
        .default("https://www.gov.uk/government/news/posting-documents-to-companies-house"),
    SERVICE_LIVE: str
        .describe("Prevent use of service until Implementation")
        .default("false"),
    VERIFY_IDENTITY_LINK: str
        .describe("Path to guidance to Verify Identity")
        .default("")
});

This is a web frontend for the PSC Verification Statements. It was created based on [Typescript Web Starter for Companies House](https://github.com/companieshouse/node-review-web-starter-ts). For the corresponding API component, see [psc-verification-api](https://github.com/companieshouse/psc-verification-api).

## Frontend technologies and utils

- [NodeJS](https://nodejs.org/)
- [ExpressJS](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Nunjucks](https://mozilla.github.io/nunjucks)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [Jest](https://jestjs.io)
- [SuperTest](https://www.npmjs.com/package/supertest)
- [Git](https://git-scm.com/downloads)

## Installing and running

### Requirements

1. node v24 (engines block in package.json is used to enforce this)
2. npm >=v10 (engines block in package.json is used to enforce this)

Having cloned the project into the working directory, run the following commands:

```shell
cd psc-verification-web
npm install
make clean build
```

The build step will additionally clone the required [companieshouse/api-enumerations](https://github.com/companieshouse/api-enumerations/) submodule.

### Running the Tests

To run all tests with coverage, use the following command:

```shell
make test
```

For more details on our approach to testing, as well as generating coverage reports, see [LLD > Testing](./docs/testing.md).

### Running the App

Running the app will require the use of [companieshouse/docker-chs-development](https://github.com/companieshouse/docker-chs-development) (private repo) to bootstrap the necessary environment. Once set up, you can enable the service like so:

```shell
chs-dev modules enable psc-verification
chs-dev services enable psc-verification-web
```

If you also want to enable development mode (debugging & hot reload):

```shell
chs-dev development enable psc-verification-web
```

To start the application, run:

```shell
chs-dev up
```

...and navigate to http://chs.local/persons-with-significant-control-verification (or whatever host values your config points to).

If you've enabled development mode, you can attach a debugger at `localhost:9236`. Each time you save the source code Nodemon will be triggered to reload the web service (~7 seconds); session data will be preserved.

# Documentation

* [High-level Design (HLD)](https://companieshouse.atlassian.net/wiki/x/roBmRAE) (private confluence page)
* [Low-level Design (LLD)](./docs/README.md)

# Configuration

System properties for the `psc-verification-web`. These are normally configured per environment.

Variable| Description                                                                           |
-------------------|---------------------------------------------------------------------------------------|
ACCOUNT_URL| URL for CHS account |
API_URL| API base URL for service interaction |
APP_NAME| Name of the application |
CACHE_SERVER| Name of the cache |
CDN_HOST| URL for the CDN |
CDN_URL_CSS| CDN URL for the CSS |
CDN_URL_JS| CDN URL for the JavaScript |
CH_NODE_UTILS_LOG_LVL| Enable the logging within ch-node-utils for localisation |
CHS_INTERNAL_API_KEY| API key for CHS service |
CHS_URL| Host URL for CHS |
CONTACT_US_LINK| Link to contact us |
COOKIE_DOMAIN| Domain for cookies |
COOKIE_NAME| Name for the cookie |
COOKIE_SECRET| Used for cookie encryption |
DEFAULT_SESSION_EXPIRATION| session expiration time|
DSR_EMAIL_ADDRESS| Email address for the DSR team |
DSR_PHONE_NUMBER| Phone number for the DSR team |
ENQUIRIES_EMAIL_ADDRESS| Email address for Companies House enquiries |
ENQUIRIES_PHONE_NUMBER| Phone number for Companies House enquiries |
GET_PSC01_LINK| Link to obtaining paper form PSC01 |
GET_RP01_LINK| Link to obtaining paper form RP01 |
HUMAN_LOG| Whether to produce a human-readable "pretty" log (1 or 0) |
IDV_IMPLEMENTATION_DATE| Date when IDV comes into effect for PSCs |
LOCALES_ENABLED| Feature flag that toggles localisation behaviour|
LOCALES_PATH| The name of the directory where the locales files are stored|
LOG_LEVEL| Logging Level |
NODE_HOSTNAME| Host name the server is hosted on|
NODE_HOSTNAME_SECURE| Hostname for the secure HTTPS server|
NODE_PORT| Port for the HTTP server|
NODE_PORT_SSL| Port for the HTTPS server|
NODE_SSL_CERTIFICATE| Path to the SSL certificate file|
NODE_SSL_ENABLED| Flag to enable SSL for the server|
NODE_SSL_PRIVATE_KEY| Path to the SSL private key file|
NUNJUCKS_LOADER_NO_CACHE| Flag to control the caching of templates in the Nunjucks loader|
NUNJUCKS_LOADER_WATCH| Flag to enable or disable watching for file changes in the Nunjucks loader |
PIWIK_SERVICE_NAME| Service name used by Matomo scripts |
PIWIK_SITE_ID| Matomo Site Id represents the environment |
PIWIK_START_GOAL_ID| Goal Id for the start button – used by matomo |
PIWIK_VERIFY_GOAL_ID| Goal Id for the "Provide verification details" button – used by matomo |
PIWIK_REQUEST_EXTENSION_GOAL_ID| Goal Id for the "Request extension" button – used by matomo |
PIWIK_URL| Link to the matomo dashboard |
POST_TO_CH_LINK| Link to guidance on submission by post |
PSC_DATA_API_FETCH_SIZE| Pagination window for psc-data-api |
PSC_EXTENSIONS_PATH| Path to build the PSC_EXTENSIONS link |
VERIFY_IDENTITY_LINK| Path to guidance to Verify Identity |
WEBFILING_LOGIN_URL| URL for Webfiling login page |

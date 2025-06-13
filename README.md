This is a web frontend for the PSC Verification Statements. It was created based on [Typescript Web Starter for Companies House](https://github.com/companieshouse/node-review-web-starter-ts).

## Frontend technologies and utils

- [NodeJS](https://nodejs.org/)
- [ExpressJS](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Nunjucks](https://mozilla.github.io/nunjucks)
- [GOV.UK Design System](https://design-system.service.gov.uk/)
- [Jest](https://jestjs.io)
- [SuperTest](https://www.npmjs.com/package/supertest)
- [Git](https://git-scm.com/downloads)

## Other CHS services
- [psc-verification-api](https://github.com/companieshouse/psc-verification-api)

## Installing and running

### Requirements

1. node v22 (engines block in package.json is used to enforce this)
2. npm >=v10 (engines block in package.json is used to enforce this)

Having cloned the project into your project root, run the following commands:

```cd psc-verification-web```

```npm install```

```make clean build``` which will add the git submodule `api-enumerations`

### SSL Set-up

- If you wish to work with ssl-enabled endpoints locally, ensure you turn the `NODE_SSL_ENABLED` property to `ON` in the config and also provide paths to your private key and certificate.

- In a typical production environment, this might never be required as the Node app usually sits behind a load balancer with SSL termination.

### Running the Tests

To run the tests, type the following command:

``` npm test ```

To get a summarised test coverage report, run:

```npm run coverage```

For a detailed test coverage report, run one of the following commands:

```npm run coverage:report```

or

```npm run test:coverage```

For these tests, we've used [Mocha](http://mochajs.org/) with [Sinon](http://sinonjs.org/) and [Chai](http://chaijs.com/).

### Running the App

To start the application, run:

``` npm start ```

or, to watch for changes with auto restart in your dev environment, run:

``` npm run start:watch ```

...and navigate to http://localhost:3000/ (or whatever hostname/port number combination you've changed the config values to)

For SSL connections, navigate to https://localhost:3443

Configuration
-------------
System properties for the `psc-verification-web`. These are normally configured per environment.

Variable| Description                                                                           |
-------------------|---------------------------------------------------------------------------------------|
API_URL| API base URL for service interaction |
APP_NAME| Name of the application |
CACHE_SERVER| Name of the cache |
CDN_HOST| URL for the CDN |
CDN_URL_CSS| CDN URL for the CSS |
CDN_URL_JS| CDN URL for the JavaScript |
CH_NODE_UTILS_LOG_LVL| Enable the logging within ch-node-utils for localisation |
CHS_API_KEY| API key for CHS service |
CHS_URL| Host URL for CHS |
CONTACT_US_LINK| Link to contact us |
COOKIE_DOMAIN| Domain for cookies |
COOKIE_NAME| Name for the cookie |
COOKIE_SECRET| Used for cookie encryption |
DEFAULT_SESSION_EXPIRATION| session expiration time|
DSR_EMAIL_ADDRESS| Email address for the DSR team |
DSR_PHONE_NUMBER| Phone number for the DSR team |
GET_PSC01_LINK| Link to obtaining paper form PSC01 |
GET_RP01_LINK| Link to obtaining paper form RP01 |
IDV_IMPLEMENTATION_DATE| Date when IDV comes into effect for PSCs |
LOCALES_ENABLED| Feature flag that toggles localisation behaviour|
LOCALES_PATH| The name of the directory where the locales files are stored|
LOG_LEVEL| Logging Level |
NODE_HOSTNAME| Host name the server is hosted on|
NODE_HOSTNAME_SECURE| Hostname for the secure HTTPS server|
NODE_PORT_SSL| Port for the HTTPS server|
NODE_SSL_CERTIFICATE| Path to the SSL certificate file|
NODE_SSL_ENABLED| Flag to enable SSL for the server|
NODE_SSL_PRIVATE_KEY| Path to the SSL private key file|
NUNJUCKS_LOADER_NO_CACHE| Flag to control the caching of templates in the Nunjucks loader|
NUNJUCKS_LOADER_WATCH| Flag to enable or disable watching for file changes in the Nunjucks loader |
PIWIK_SERVICE_NAME| Service name used by Matomo scripts |
PIWIK_SITE_ID| Matomo Site Id represents the environment |
PIWIK_START_GOAL_ID| Goal Id for the start button used by matomo |
PIWIK_URL| Link to the matomo dashboard |
POLICIES_LINK| Link to policies |
PORT| Port to run the web server on |
POST_TO_CH_LINK| Link to guidance on submission by post |
SERVICE_LIVE| Prevent use of service until Implementation |
VERIFY_IDENTITY_LINK| Path to guidance to Verify Identity |

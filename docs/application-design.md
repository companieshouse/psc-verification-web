# Application Design
This document provides an overview of the application design patterns and principles used in psc-verification-web. It covers the structure and responsibilities of middleware, routers, handlers, and services.

## Middleware
In psc-verification-web, middleware is used for any logic that must run once on every request or set of requests. Some of the responsibilities of middleware in psc-verification-web include:

- **Session Management**: Managing user sessions, including storing and retrieving session data.
- **Authentication**: Ensuring that users are authenticated via web-security-node's [authMiddleware](https://github.com/companieshouse/web-security-node/blob/master/src/index.ts).
- **Error Handling**: Capturing and handling errors to present users with appropriate error screens. For more details, see [Error Handling](./error-handling.md).
- **Request Logging**: Logging details of incoming requests for debugging and monitoring purposes.
- **Fetching Data**: Loading data required for request handling, such as company profile and identity verification details.
- **Security**: Handling certain security measures such as CSRF protection.

### Scoped Middleware
Some middleware, such as the request ID generator, runs on every request, including health checks. This is an example of unscoped or catch-all middleware:

```ts
// app.ts
app.use(requestIdGenerator);
```

In most cases, however, we want to specify a set of routes under which a piece of middleware will run. There are two ways to do this:
```ts
// Method 1: in app.ts
app.use(servicePathPrefix, sessionMiddleware);

// Method 2: in routerDispatch.ts
router.use(Urls.NAME_MISMATCH, authenticate, fetchVerification, NameMismatchRouter);
```

Method 1 applies `sessionMiddleware` to any routes matching `servicePathPrefix`. This will match `"/persons-with-significant-control-verification"` and any of its sub-paths like `"/persons-with-significant-control-verification/start"`.

Method 2 applies `authenticate` and `fetchVerification` to just the `Urls.NAME_MISMATCH` path. `router.use` will accept any number of middleware or a spread list:
```ts
const middleware = [authenticate, fetchVerification];
router.use(Urls.NAME_MISMATCH, ...middleware, NameMismatchRouter);
```

## Router/Handler/Service Architecture
In psc-verification-web, the responsibilities of handling each request are split into the following:

### Routers
Routers are responsible for defining endpoints and mapping requests to the appropriate handlers. `src/routerDispatch.ts` points each endpoint/service path to its corresponding router like so:
```ts
router.use(Urls.START, /* ...middleware */, StartRouter);
```

The router then initialises the corresponding handler and renders the screen based on the view data returned from the handler. In some cases, the router may redirect based on a condition, as is the case with the POST mapping in `nameMismatchHandler.ts`:
```ts
// Snippet from nameMismatchHandler.ts
nameMismatchRouter.post("/", handleExceptions(async (req: Request, res: Response, _next: NextFunction) => {
    const handler = new NameMismatchHandler();
    const params = await handler.executePost(req, res);

    if (!Object.keys(params.viewData.errors).length) {
        res.redirect(params.viewData.nextPageUrl);
    } else {
        res.render(params.templatePath, params.viewData);
    }
}));
```

### Handlers
Handlers are responsible for processing data from various sources and returning view data for screens to be rendered. They receive data from requests (such as form submissions or query parameters), validate and sanitize the input, and handle any errors before further processing. Often, handlers will also interact with service classes to perform CRUD operations on backing data.

After gathering and processing input data, handlers construct the view data to be returned to the corresponding router. This includes main content, locale functionality, and any potential error messages, user context, or navigation information.

### Services
Services in psc-verification-web are responsible for encapsulating data access logic and integration with external APIs such as the [Transactions API](https://github.com/companieshouse/transactions.api.ch.gov.uk), [PSC Verification API](https://github.com/companieshouse/psc-verification-api/), and [Company Profile API](https://github.com/companieshouse/company-profile-api). This includes constructing requests, parsing responses, and handling any potential errors.

To ensure consistency across all CH services, API calls are defined in the common [api-sdk-node](https://github.com/companieshouse/api-sdk-node) package.


# Logging

Logging is handled in a few key ways in psc-verification-web:

1. Automatic logging via external middleware like `sessionMiddleware`.
2. Implicit logging via thrown Errors.
3. Explicit logging via [ch-structured-logging-node](https://github.com/companieshouse/ch-structured-logging-node).

This document refers to methods 2 and 3.

## Logging format

### Format
The format we use for logging is as follows:

```log
{date}: {log-level}: {class-name}::{method-name} - {message}
  -> {context}
```

Context is typically useful when utilising functions like `logger.errorRequest` which take extra context from the current Express `Request`.

### Example
```log
2025-05-30T13:04:40.996+00:00 info: StartHandler::executeGet - called to serve start page
  -> created: 2025-05-30T13:04:40.996+00:00
  -> event: info
  -> namespace: psc-verification-web
```

## Usage
For 99% of log use, the developer only needs to know to call one of the following methods:
* `logger.error(message)` or `logger.errorRequest(req, message)`
* `logger.info(message)` or `logger.infoRequest(req, message)`
* `logger.debug(message)` or `logger.debugRequest(req, message)`
* `logger.trace(message)` or `logger.traceRequest(req, message)`

Everything else, including the `ClassName::methodName -` prefix, will be automatically inserted. A typical log line may look like:

```ts
// Fictional example: getCompany() in the CompanyService class
logger.error(`No response from API for companyNumber="${companyNumber}"`);
```
```
2025-05-30T13:04:40.996+00:00 error: CompanyService::getCompany - No response from API for companyNumber="00006400"
  -> ...
```

### Implicit logging via thrown Errors
Throwing an error implicitly generates a log in a very similar way. For example:
```ts
// Fictional example: getPsc() in the PscService class
throw new HttpError(`PSC not found`, HttpStatusCode.NotFound);
```
```
2025-05-30T13:04:40.996+00:00 error: PscService::getPsc - 404 HttpError: PSC not found
  stack trace start
  ...
  stack trace end
  -> ...
```
2025-05-30T14:31:55.143+00:00 error: StartHandler::executeGet - 501 HttpError: not implemented

### Advanced
`logger` is actually a custom wrapper (called `PrefixedLogger`) around [ch-structured-logging-node](https://github.com/companieshouse/ch-structured-logging-node)'s `ApplicationLogger`. All it does is prepend the `ClassName::methodName -` prefix to every log line.

This works by creating a dummy `Error` and parsing the stack trace to find the function that called for the logger. The `Error` is only instantiated, not thrown.

Typically this works without any extra steps, however there's a caveat for pieces of code like error interceptors and the logging interceptor where you have to be specific about where you're looking in the stack trace in order to get the correct function call back.

For this reason, `PrefixedLogger` exposes an inner `raw` member which allows access to the underlying `ApplicationLogger`. For example: `logger.raw.debug(...)`. `PrefixedLogger` also has a `getPrefix()` method which can take arguments for targeting specific stack lines. See the examples below.

#### Stack position
[requestLogger.ts](https://github.com/companieshouse/psc-verification-web/blob/main/src/middleware/requestLogger.ts) is an example of a piece of code where the stack position of the function call we want to log out isn't where it would usually be. 

In the case of `requestLogger`, that's because the prefix cannot be generated within the `res.on("finish")` callback since the callback is handled by Express. Instead, the prefix is pre-generated. Because of this, there's one less function call in between `requestLogger` and `getPrefix`. What would usually be `requestLogger -> logger.debug -> this.getPrefix` is now instead `requestLogger -> logger.getPrefix`.

A fictional example: `logger.getPrefix({ stackPos: 2 })`

```diff
Error
  at LoggingInterceptor.handle (/app/src/middleware/loggingInterceptor.ts:42:15)
+ at CompanyService.getCompany (/app/src/services/companyService.ts:88:22)
  at processTicksAndRejections (node:internal/process/task_queues:96:5)
```
Output
```
CompanyService::getCompany
```

#### Usage in error interceptors
Since error interceptors are already dealing with an `Error`, the default strategy of instantiating a new `Error` won't work since the throwing code is referenced only in the original `Error`. In this case, there's an option to pass it through via: `logger.getPrefix({ error: error })`. See [httpErrorInterceptor.ts](https://github.com/companieshouse/psc-verification-web/blob/main/src/middleware/error-interceptors/httpErrorInterceptor.ts) for a real example.

## Best practices

### Identifiers
Identifiers should typically be in the format `companyNumber="${...}", transactionId="${...}", ...`. This is a convention that allows us to more easily search for identifiers across services.

> [!NOTE]  
> Ensure that the double quotes around the ID are present, as it's easy to forget.

### What *not* to log :x:

#### Personal information
- Full names
- Addresses
- Email addresses
- Phone numbers
- Any data protected under GDPR or similar

#### Client information
- IP addresses
- Authentication credentials like passwords and tokens.
- Other sensitive client identifiers

#### Other
- Full request or response bodies containing user-submitted data.

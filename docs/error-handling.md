# Error Handling

Error handling in `psc-verification-web` is mostly typical but includes some extra functionality to allow for more easily presenting error screens to an end user.

Our approach uses custom error classes that extend the Node.js `Error` class, such as `HttpError` and `DataIntegrityError`. These classes allow for more specific error scenarios, such as the `HttpError`, which takes a `status: HttpStatusCode` in addition to an error message.

The advantage of this approach is that we can use error interceptor middleware to have a standard way of presenting specific errors to the user. For instance, the `httpErrorInterceptor` will intercept a `HttpError` and convert the status into a Nunjucks template name like so:
```ts
// If uncaught, this will render '404-not-found.njk'
throw new HttpError("Couldn't find resource with id=...", HttpStatusCode.NotFound);
```

As the comment above notes, only uncaught errors will make it to the error interceptor middleware and be presented to the user.

## Logging
Logging occurs automatically based on the error message. See [Logging > Usage > Implicit logging via thrown errors](./logging.md#implicit-logging-via-thrown-errors) for more details.

## Usage
This section covers some specifics of how to use different error types and how they will be interpreted by their respective error interceptors.

### Error
Base `Error` instances will be picked up by the `httpErrorInterceptor` and handled as though they are a `HttpError` with a status of 500 (Internal Server Error).

```ts
throw new Error("Something went terribly wrong!");
```

### HttpError
As discussed previously, the `HttpError` class is handled in a special way. Its status is dynamically converted into a Nunjucks template name following the format: `{http status code}-{http error name}.njk`. Because of this, HTTP error templates must strictly follow this filename format.

If a `HttpError` is thrown with a status that doesn't have a corresponding Nunjucks template, the HTTP error interceptor will set the HTTP response status appropriately but will render the `500-internal-server-error.njk` template as a fallback.

```ts
// Both of these render 404-not-found.njk
throw new HttpError("Couldn't find resource with id=...", HttpStatusCode.NotFound);
throw new HttpError("Couldn't find resource with id=...", 404);
```

### DataIntegrityError
The `DataIntegrityError` class takes a `type: DataIntegrityErrorType`, such as `DataIntegrityErrorType.PSC_DATA`. The `dataIntegrityErrorInterceptor` then uses a switch statement to determine which screen should be presented to the user based on the type. For `PSC_DATA`, that screen is the `problem-with-psc-data.njk` template.

```ts
throw new DataIntegrityError("PSC is missing a required field ...", DataIntegrityErrorType.PSC_DATA);
```

## Development
The following sections provide guidance on how to extend or implement a custom error class or error interceptor. Random examples are given.

### Adding an interceptor for a new *type* of error
1. Define a new error class – `IdvError` with an `IdvErrorType` enum parameter.
2. Write a new interceptor with either a switch statement for the enum cases or logic to determine which screen to render – `idvErrorInterceptor`.
3. Create the appropriate template(s).

### Adding a new error case to an existing error interceptor
1. Add a new enum case (if necessary) – `DataIntegrityErrorType.COMPANY_DATA`.
2. If the interceptor uses a switch statement, add a branch for the new enum case.
3. Create the appropriate template.
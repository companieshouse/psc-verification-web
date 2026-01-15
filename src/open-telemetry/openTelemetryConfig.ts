import applicationConfiguration from "./applicationConfiguration";

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

const openTelemetryConfig: applicationConfiguration = {
    port: parseInt(process.env.PSC_VERIFICATION_WEB_PORT as string),
    apiAddress: process.env.INTERNAL_API_URL as string,
    internalApiKey: process.env.CHS_INTERNAL_API_KEY as string,
    env: (process.env.NODE_ENV || "development").toLowerCase(),
    urlPrefix: "persons-with-significant-control-verification",
    session: {
        cookieName: process.env.COOKIE_NAME as string,
        cookieSecret: process.env.COOKIE_SECRET as string,
        cookieDomain: process.env.COOKIE_DOMAIN as string,
        cacheServer: process.env.CACHE_SERVER as string
    },
    applicationNamespace: process.env.APP_NAME as string,
    baseUrl: process.env.CHS_URL ?? "",
    otel: {
        traceExporterUrl: `${otlpEndpoint}/v1/traces`,
        metricsExporterUrl: `${otlpEndpoint}/v1/metrics`,
        otelLogEnabled: process.env.OTEL_LOG_ENABLED === "true"
    }
};

const httpsProxy = process.env.HTTPS_PROXY;

if (httpsProxy) {

    const proxyUrl = new URL(httpsProxy);

    openTelemetryConfig.proxy = {
        host: proxyUrl.hostname,
        port: parseInt(proxyUrl.port)
    };
}

export default openTelemetryConfig;

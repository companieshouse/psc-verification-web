import ApplicationConfiguration from "./applicationConfiguration";
import { env } from "../config";

const otlpEndpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT;

const openTelemetryConfig: ApplicationConfiguration = {
    port: parseInt(env.PSC_VERIFICATION_WEB_PORT),
    apiAddress: env.INTERNAL_API_URL,
    internalApiKey: env.CHS_INTERNAL_API_KEY,
    env: (env.NODE_ENV || "development").toLowerCase(),
    urlPrefix: "persons-with-significant-control-verification",
    session: {
        cookieName: env.COOKIE_NAME,
        cookieSecret: env.COOKIE_SECRET,
        cookieDomain: env.COOKIE_DOMAIN,
        cacheServer: env.CACHE_SERVER
    },
    applicationNamespace: env.APP_NAME,
    baseUrl: env.CHS_URL ?? "",
    otel: {
        traceExporterUrl: `${otlpEndpoint}/v1/traces`,
        metricsExporterUrl: `${otlpEndpoint}/v1/metrics`,
        otelLogEnabled: env.OTEL_LOG_ENABLED === "true"
    }
};

export default openTelemetryConfig;

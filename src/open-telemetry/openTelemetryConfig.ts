import { env } from "../config";

interface OpenTelemetryConfiguration {
    env: string;
    applicationNamespace: string;
    baseUrl: string;
    otel: {
        otelLogEnabled: boolean;
        traceExporterUrl: string;
        metricsExporterUrl: string;
    };
}

const otlpEndpoint = env.OTEL_EXPORTER_OTLP_ENDPOINT;

const openTelemetryConfig: OpenTelemetryConfiguration = {
    env: (env.NODE_ENV || "development").toLowerCase(),
    applicationNamespace: env.APP_NAME,
    baseUrl: env.CHS_URL ?? "",
    otel: {
        traceExporterUrl: `${otlpEndpoint}/v1/traces`,
        metricsExporterUrl: `${otlpEndpoint}/v1/metrics`,
        otelLogEnabled: env.OTEL_LOG_ENABLED === "true"
    }
};

export default openTelemetryConfig;

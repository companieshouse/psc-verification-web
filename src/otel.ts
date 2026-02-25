import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import openTelemetryConfig from "./open-telemetry/openTelemetryConfig";
import { ALLOW_ALL_BAGGAGE_KEYS, BaggageSpanProcessor } from "@opentelemetry/baggage-span-processor";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

const traceExporter = new OTLPTraceExporter({
    url: openTelemetryConfig.otel?.traceExporterUrl,
    headers: {}
});
const sdk = new NodeSDK({
    spanProcessors: [
        new BaggageSpanProcessor(ALLOW_ALL_BAGGAGE_KEYS),
        new BatchSpanProcessor(traceExporter)
    ],

    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: openTelemetryConfig.otel?.metricsExporterUrl,
            headers: {}
        })
    }),
    instrumentations: [getNodeAutoInstrumentations()]
});

if (openTelemetryConfig.otel?.otelLogEnabled) {
    // initialising structured logging before OpenTelemetry can cause issues so omitted for now
    console.info("Starting OpenTelemetry SDK...");
    try {
        sdk.start();
        console.info("OpenTelemetry SDK started successfully.");
    } catch (error) {
        console.error("Failed to start OpenTelemetry SDK:", error);
    }
}

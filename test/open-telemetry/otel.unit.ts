import { NodeSDK } from "@opentelemetry/sdk-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

// Mock OpenTelemetry dependencies
jest.mock("@opentelemetry/sdk-node");
jest.mock("@opentelemetry/exporter-trace-otlp-proto");
jest.mock("@opentelemetry/exporter-metrics-otlp-proto");
jest.mock("@opentelemetry/sdk-metrics");
jest.mock("@opentelemetry/baggage-span-processor");
jest.mock("@opentelemetry/sdk-trace-node");

describe("otel.ts", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should initialize NodeSDK with correct configuration", () => {
        jest.isolateModules(() => {
            require("../../src/otel");
            require("../../src/open-telemetry/openTelemetryConfig");
        });

        expect(OTLPMetricExporter).toHaveBeenCalledWith({
            url: "http://otel-collector:4318/v1/metrics",
            headers: {}
        });

        expect(OTLPTraceExporter).toHaveBeenCalledWith({
            url: "http://otel-collector:4318/v1/traces",
            headers: {}
        });

        expect(NodeSDK).toHaveBeenCalledWith({
            spanProcessors: expect.any(Array),
            metricReader: expect.any(PeriodicExportingMetricReader),
            instrumentations: expect.any(Array)
        });
    });

    it("should not call sdk.start() when otelLogEnabled is false", () => {
        process.env.OTEL_LOG_ENABLED = "false";

        const startMock = jest.fn();
        (NodeSDK as jest.Mock).mockImplementation(() => ({
            start: startMock
        }));

        jest.isolateModules(() => {
            require("../../src/otel");
        });

        expect(startMock).not.toHaveBeenCalled();
    });

    it("should call sdk.start() when otelLogEnabled is true", () => {
        process.env.OTEL_LOG_ENABLED = "true";

        const startMock = jest.fn();
        (NodeSDK as jest.Mock).mockImplementation(() => ({
            start: startMock
        }));

        jest.isolateModules(() => {
            require("../../src/otel");
        });

        expect(startMock).toHaveBeenCalledTimes(1);
    });
});

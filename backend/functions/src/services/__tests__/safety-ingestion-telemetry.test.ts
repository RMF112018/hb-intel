import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  SAFETY_INGESTION_BACKEND_VERSION,
  emitSafetyIngestionEvent,
  emitSafetyIngestionMetric,
} from '../safety-ingestion-telemetry.js';

describe('safety-ingestion-telemetry', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('emits customEvent envelopes with correlation context', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    emitSafetyIngestionEvent(
      'safety.ingestion.preview.evaluated',
      { operation: 'preview', requestId: 'req-1', runId: 'run-2', attemptNumber: 2 },
      { commitReadiness: true },
    );

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(payload._telemetryType).toBe('customEvent');
    expect(payload.name).toBe('safety.ingestion.preview.evaluated');
    expect(payload.requestId).toBe('req-1');
    expect(payload.runId).toBe('run-2');
    expect(payload.attemptNumber).toBe(2);
  });

  it('redacts sensitive workbook-like fields', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    emitSafetyIngestionEvent(
      'safety.ingestion.request.received',
      { operation: 'ingest' },
      {
        fileContentBase64: 'AAAA',
        rawChecklistJson: '{"unsafe":true}',
      },
    );
    const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(payload.fileContentBase64).toBe('[REDACTED]');
    expect(payload.rawChecklistJson).toBe('[REDACTED]');
  });

  it('emits customMetric envelopes', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    emitSafetyIngestionMetric('safety.ingestion.duration.ms', 1234, {
      operation: 'replay',
      requestId: 'req-2',
    });
    const payload = JSON.parse(String(logSpy.mock.calls[0]?.[0])) as Record<string, unknown>;
    expect(payload._telemetryType).toBe('customMetric');
    expect(payload.name).toBe('safety.ingestion.duration.ms');
    expect(payload.value).toBe(1234);
  });

  it('stamps every event and metric with the backend version so live logs prove artifact identity', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    emitSafetyIngestionEvent(
      'safety.ingestion.entry',
      { operation: 'ingest', requestId: 'req-v1' },
      { codePath: 'graph-only' },
    );
    emitSafetyIngestionMetric('safety.ingestion.duration.ms', 42, {
      operation: 'ingest',
      requestId: 'req-v1',
    });

    const payloads = logSpy.mock.calls.map((call) => JSON.parse(String(call[0])) as Record<string, unknown>);
    for (const payload of payloads) {
      expect(payload.backendVersion).toBe(SAFETY_INGESTION_BACKEND_VERSION);
    }
    // Resolver read @hbc/functions/package.json at module load and found a version.
    expect(typeof SAFETY_INGESTION_BACKEND_VERSION).toBe('string');
    expect(SAFETY_INGESTION_BACKEND_VERSION.length).toBeGreaterThan(0);
    // Under test runtime the resolver must not fall back to 'unknown' —
    // that would indicate the artifact-version seam is broken.
    expect(SAFETY_INGESTION_BACKEND_VERSION).not.toBe('unknown');
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
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
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  emitSafetyFrontendEvent,
  resetSafetyFrontendTelemetrySink,
  setSafetyFrontendTelemetrySink,
  type SafetyFrontendTelemetryEvent,
} from './safetyFrontendTelemetry.js';

describe('safetyFrontendTelemetry', () => {
  afterEach(() => {
    resetSafetyFrontendTelemetrySink();
    vi.restoreAllMocks();
  });

  describe('default sink', () => {
    it('emits a structured customEvent payload via console.log', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      emitSafetyFrontendEvent({
        name: 'safety.frontend.command.start',
        operation: 'preview',
        lifecycle: 'start',
        frontendRequestId: 'fid-1',
        timestamp: '2026-04-24T00:00:00.000Z',
      });
      expect(logSpy).toHaveBeenCalledTimes(1);
      const arg = logSpy.mock.calls[0]?.[0];
      expect(typeof arg).toBe('string');
      const parsed = JSON.parse(String(arg));
      expect(parsed).toMatchObject({
        level: 'info',
        _telemetryType: 'customEvent',
        name: 'safety.frontend.command.start',
        operation: 'preview',
        lifecycle: 'start',
        frontendRequestId: 'fid-1',
        timestamp: '2026-04-24T00:00:00.000Z',
      });
    });

    it('stamps timestamp when caller omits it', () => {
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      emitSafetyFrontendEvent({ name: 'safety.frontend.test' });
      const parsed = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
      expect(typeof parsed.timestamp).toBe('string');
      // ISO-8601 sanity: parses to a valid date.
      expect(Number.isFinite(Date.parse(parsed.timestamp))).toBe(true);
    });
  });

  describe('sink injection', () => {
    it('routes events to the injected sink', () => {
      const captured: SafetyFrontendTelemetryEvent[] = [];
      setSafetyFrontendTelemetrySink((event) => captured.push(event));
      emitSafetyFrontendEvent({
        name: 'safety.frontend.command.complete',
        operation: 'ingest',
        lifecycle: 'complete',
        frontendRequestId: 'fid-2',
        requestId: 'backend-9',
        properties: { httpStatus: 200, attempts: 1, durationMs: 42 },
      });
      expect(captured).toHaveLength(1);
      expect(captured[0]).toMatchObject({
        name: 'safety.frontend.command.complete',
        operation: 'ingest',
        lifecycle: 'complete',
        frontendRequestId: 'fid-2',
        requestId: 'backend-9',
        properties: { httpStatus: 200, attempts: 1, durationMs: 42 },
      });
    });

    it('reset returns the default sink', () => {
      const captured: SafetyFrontendTelemetryEvent[] = [];
      setSafetyFrontendTelemetrySink((event) => captured.push(event));
      resetSafetyFrontendTelemetrySink();
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      emitSafetyFrontendEvent({ name: 'safety.frontend.after-reset' });
      expect(captured).toHaveLength(0);
      expect(logSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('redaction', () => {
    let captured: SafetyFrontendTelemetryEvent[];

    beforeEach(() => {
      captured = [];
      setSafetyFrontendTelemetrySink((event) => captured.push(event));
    });

    it('redacts property names matching the deny-list', () => {
      emitSafetyFrontendEvent({
        name: 'safety.frontend.test',
        properties: {
          httpStatus: 200,
          token: 'eyJhbGciOi...',
          jwt: 'should-be-hidden',
          authorization: 'Bearer xyz',
          fileContentBase64: 'aGVsbG8=',
          rawChecklistJson: '{"hidden":true}',
          workbook: { bytes: '...' },
          password: 'p4ss',
          secret: 's3cr3t',
        },
      });
      const props = captured[0]?.properties ?? {};
      expect(props.httpStatus).toBe(200);
      expect(props.token).toBe('[REDACTED]');
      expect(props.jwt).toBe('[REDACTED]');
      expect(props.authorization).toBe('[REDACTED]');
      expect(props.fileContentBase64).toBe('[REDACTED]');
      expect(props.rawChecklistJson).toBe('[REDACTED]');
      expect(props.workbook).toBe('[REDACTED]');
      expect(props.password).toBe('[REDACTED]');
      expect(props.secret).toBe('[REDACTED]');
    });

    it('recurses into nested objects to redact deny-listed keys', () => {
      emitSafetyFrontendEvent({
        name: 'safety.frontend.test',
        properties: {
          context: {
            uploadedByUpn: 'coordinator@example.com',
            fileContentBase64: 'aGVsbG8=',
            details: {
              workbook: 'inner',
              ok: true,
            },
          },
        },
      });
      const ctx = (captured[0]?.properties?.context ?? {}) as Record<string, unknown>;
      expect(ctx.uploadedByUpn).toBe('coordinator@example.com');
      expect(ctx.fileContentBase64).toBe('[REDACTED]');
      const details = ctx.details as Record<string, unknown>;
      expect(details.workbook).toBe('[REDACTED]');
      expect(details.ok).toBe(true);
    });

    it('drops non-serializable values without throwing', () => {
      emitSafetyFrontendEvent({
        name: 'safety.frontend.test',
        properties: {
          httpStatus: 200,
          handler: () => 'do not emit',
          big: BigInt(10),
        },
      });
      const props = captured[0]?.properties ?? {};
      expect(props.httpStatus).toBe(200);
      expect(props.handler).toBeUndefined();
      expect(props.big).toBeUndefined();
    });
  });

  describe('failure isolation', () => {
    it('swallows sink errors so telemetry never throws into callers', () => {
      setSafetyFrontendTelemetrySink(() => {
        throw new Error('sink exploded');
      });
      expect(() =>
        emitSafetyFrontendEvent({ name: 'safety.frontend.boom' }),
      ).not.toThrow();
    });
  });
});

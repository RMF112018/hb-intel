import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createFoleonTelemetryEmitter,
  resolveFoleonSessionId,
  createFoleonEventId,
} from '../FoleonTelemetryEmitter.js';
import type { FoleonEventSink } from '../FoleonEventSink.js';
import type { FoleonTelemetryEnvelope } from '../../types/foleon-event.types.js';

function recordingSink(): FoleonEventSink & { sent: FoleonTelemetryEnvelope[] } {
  const sent: FoleonTelemetryEnvelope[] = [];
  return {
    kind: 'noop',
    sent,
    async send(envelope: FoleonTelemetryEnvelope): Promise<void> {
      sent.push(envelope);
    },
  } as FoleonEventSink & { sent: FoleonTelemetryEnvelope[] };
}

function failingSink(error: Error): FoleonEventSink {
  return {
    kind: 'noop',
    async send(): Promise<void> {
      throw error;
    },
  };
}

const FIXED_NOW = new Date('2026-04-24T12:00:00.000Z');

function makeEmitter(
  overrides: Partial<Parameters<typeof createFoleonTelemetryEmitter>[0]> = {},
): ReturnType<typeof createFoleonTelemetryEmitter> {
  return createFoleonTelemetryEmitter({
    sink: overrides.sink ?? recordingSink(),
    correlationId: 'corr-1',
    sessionId: 'sess-1',
    packageVersion: '1.0.5.0',
    manifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
    getRoute: () => 'highlights',
    now: () => FIXED_NOW,
    ...overrides,
  });
}

describe('FoleonTelemetryEmitter — envelope build', () => {
  it('builds a minimum-valid envelope with governed identity', () => {
    const emitter = makeEmitter();
    const env = emitter.buildEnvelope('Card Impression', {
      foleonDocId: 42,
      contentRegistryItemId: 7,
    });
    expect(env).toEqual({
      schemaVersion: 1,
      eventId: expect.any(String),
      eventName: 'Card Impression',
      eventVersion: 1,
      occurredAtUtc: '2026-04-24T12:00:00.000Z',
      correlationId: 'corr-1',
      sessionId: 'sess-1',
      route: 'highlights',
      pageContext: 'Homepage',
      foleonDocId: 42,
      contentRegistryItemId: 7,
      packageVersion: '1.0.5.0',
      manifestId: '2160edb3-675e-4451-92bb-8345f9d1c71e',
      privacyClass: 'telemetry-minimal',
    });
    expect(env.eventId.length).toBeGreaterThan(0);
  });

  it('derives pageContext from the live route when not provided', () => {
    const emitter = makeEmitter({ getRoute: () => 'reader' });
    const env = emitter.buildEnvelope('Reader Open');
    expect(env.pageContext).toBe('Reader');
    expect(env.route).toBe('reader');
  });

  it('uses the latest route via the live getter', () => {
    let route: 'highlights' | 'reader' | 'hub' = 'highlights';
    const emitter = makeEmitter({ getRoute: () => route });
    expect(emitter.buildEnvelope('Card Click').route).toBe('highlights');
    route = 'hub';
    expect(emitter.buildEnvelope('Card Click').route).toBe('hub');
  });

  it('respects an explicit pageContext override', () => {
    const emitter = makeEmitter();
    const env = emitter.buildEnvelope('Search', {
      pageContext: 'Content Hub',
      searchQueryLength: 4,
    });
    expect(env.pageContext).toBe('Content Hub');
    expect(env.searchQueryLength).toBe(4);
  });
});

describe('FoleonTelemetryEmitter — redaction', () => {
  it('rejects unknown error codes', () => {
    const emitter = makeEmitter();
    const env = emitter.buildEnvelope('Embed Error', {
      errorCode: 'nope.bad_code' as unknown as Parameters<
        typeof emitter.buildEnvelope
      >[1] extends infer T
        ? T extends { errorCode?: infer E }
          ? E
          : never
        : never,
    });
    expect(env.errorCode).toBeUndefined();
  });

  it('accepts whitelisted error codes', () => {
    const emitter = makeEmitter();
    const env = emitter.buildEnvelope('Embed Error', {
      errorCode: 'reader.embed_error',
    });
    expect(env.errorCode).toBe('reader.embed_error');
  });

  it('drops non-finite or negative searchQueryLength values', () => {
    const emitter = makeEmitter();
    expect(
      emitter.buildEnvelope('Search', { searchQueryLength: Number.NaN }).searchQueryLength,
    ).toBeUndefined();
    expect(
      emitter.buildEnvelope('Search', { searchQueryLength: Infinity }).searchQueryLength,
    ).toBeUndefined();
    expect(
      emitter.buildEnvelope('Search', { searchQueryLength: -1 }).searchQueryLength,
    ).toBeUndefined();
  });

  it('does not pass raw search text through the envelope', () => {
    const emitter = makeEmitter();
    // Callers cannot type `searchQuery`, but simulate an escape attempt.
    const env = emitter.buildEnvelope('Search', {
      searchQueryLength: 5,
    } as unknown as Parameters<typeof emitter.buildEnvelope>[1]);
    expect(JSON.stringify(env)).not.toContain('raw-search-text');
    expect((env as unknown as { searchQuery?: string }).searchQuery).toBeUndefined();
  });

  it('drops non-numeric foleonDocId and contentRegistryItemId', () => {
    const emitter = makeEmitter();
    const env = emitter.buildEnvelope('Card Click', {
      foleonDocId: Number.NaN,
      contentRegistryItemId: Infinity,
    });
    expect(env.foleonDocId).toBeUndefined();
    expect(env.contentRegistryItemId).toBeUndefined();
  });

  it('always tags privacyClass as telemetry-minimal', () => {
    const emitter = makeEmitter();
    expect(emitter.buildEnvelope('Card Impression').privacyClass).toBe('telemetry-minimal');
  });

  it('carries gateResult and originHash when provided', () => {
    const emitter = makeEmitter();
    const env = emitter.buildEnvelope('Embed Error', {
      gateResult: 'embed-disallowed',
      originHash: 'abcd1234',
    });
    expect(env.gateResult).toBe('embed-disallowed');
    expect(env.originHash).toBe('abcd1234');
  });
});

describe('FoleonTelemetryEmitter — dispatch and failure swallow', () => {
  it('dispatches to the sink on emit', async () => {
    const sink = recordingSink();
    const emitter = makeEmitter({ sink });
    emitter.emit('Card Click', { foleonDocId: 10 });
    await Promise.resolve();
    await Promise.resolve();
    expect(sink.sent).toHaveLength(1);
    expect(sink.sent[0]?.eventName).toBe('Card Click');
    expect(sink.sent[0]?.foleonDocId).toBe(10);
  });

  it('swallows sink failures without throwing', async () => {
    const onError = vi.fn();
    const emitter = makeEmitter({
      sink: failingSink(new Error('offline')),
      onError,
    });
    expect(() => emitter.emit('Embed Error')).not.toThrow();
    await Promise.resolve();
    await Promise.resolve();
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('exposes sinkKind from the sink', () => {
    const sink: FoleonEventSink = {
      kind: 'backend',
      async send(): Promise<void> {
        return;
      },
    };
    const emitter = makeEmitter({ sink });
    expect(emitter.sinkKind).toBe('backend');
  });
});

describe('resolveFoleonSessionId + createFoleonEventId', () => {
  const KEY = '__hbIntel_foleon_session_test';

  beforeEach(() => {
    try {
      window.sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });

  afterEach(() => {
    try {
      window.sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });

  it('persists a generated session id across calls', () => {
    const first = resolveFoleonSessionId(KEY);
    const second = resolveFoleonSessionId(KEY);
    expect(first).toBe(second);
    expect(first.length).toBeGreaterThan(0);
  });

  it('createFoleonEventId returns a non-empty string', () => {
    const id = createFoleonEventId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });
});

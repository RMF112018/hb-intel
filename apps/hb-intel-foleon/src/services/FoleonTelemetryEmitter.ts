/**
 * Central telemetry emitter for the Foleon web part.
 *
 * All routes and components emit interaction events through this
 * object. The emitter:
 *  - builds a typed `FoleonTelemetryEnvelope` with correlation/session
 *    identity and package/manifest governance,
 *  - redacts inputs (drops unknown fields, rejects raw queries, clamps
 *    error codes),
 *  - dispatches to the active `FoleonEventSink`,
 *  - swallows sink failures so telemetry never surfaces to the user.
 *
 * Sink selection happens in `mount.tsx`; callsites never see the sink
 * directly. This is the seam that flips SharePoint → backend without
 * touching any route component.
 */
import type { FoleonRoute } from '../runtime/foleonRuntimeContract.js';
import type {
  FoleonErrorCode,
  FoleonEventType,
  FoleonPageContext,
  FoleonTelemetryEmitInput,
  FoleonTelemetryEnvelope,
} from '../types/foleon-event.types.js';
import type { FoleonEventSink } from './FoleonEventSink.js';

const KNOWN_ERROR_CODES: ReadonlySet<FoleonErrorCode> = new Set([
  'reader.embed_error',
  'reader.gate_blocked',
  'reader.config_incomplete',
  'content.fetch_failed',
  'hub.search_failed',
]);

export function createFoleonEventId(): string {
  const cryptoRef = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  if (cryptoRef?.randomUUID) return cryptoRef.randomUUID();
  return `fol-${Date.now()}-${Math.floor(Math.random() * 1e9).toString(16)}`;
}

export interface FoleonTelemetryEmitterParams {
  readonly sink: FoleonEventSink;
  readonly correlationId: string;
  readonly sessionId: string;
  readonly packageVersion: string;
  readonly manifestId: string;
  /**
   * Live accessor for the current route. Passed as a getter so the
   * emitter always reflects the app's latest navigation state without
   * needing to be rebuilt on every route change.
   */
  readonly getRoute: () => FoleonRoute;
  /**
   * Optional swallow hook for diagnostics. Default behavior is silent.
   */
  readonly onError?: (err: unknown) => void;
  /**
   * Optional `now()` override for tests.
   */
  readonly now?: () => Date;
}

export interface FoleonTelemetryEmitter {
  emit(eventName: FoleonEventType, partial?: FoleonTelemetryEmitInput): void;
  buildEnvelope(
    eventName: FoleonEventType,
    partial?: FoleonTelemetryEmitInput,
  ): FoleonTelemetryEnvelope;
  readonly sinkKind: FoleonEventSink['kind'];
}

export function createFoleonTelemetryEmitter(
  params: FoleonTelemetryEmitterParams,
): FoleonTelemetryEmitter {
  const now = params.now ?? ((): Date => new Date());
  const onError = params.onError ?? ((): void => undefined);

  const buildEnvelope = (
    eventName: FoleonEventType,
    partial?: FoleonTelemetryEmitInput,
  ): FoleonTelemetryEnvelope => {
    const route = params.getRoute();
    const pageContext = partial?.pageContext ?? pageContextFromRoute(route);
    const errorCode =
      partial?.errorCode && KNOWN_ERROR_CODES.has(partial.errorCode)
        ? partial.errorCode
        : undefined;
    const searchQueryLength =
      typeof partial?.searchQueryLength === 'number' &&
      Number.isFinite(partial.searchQueryLength) &&
      partial.searchQueryLength >= 0
        ? Math.floor(partial.searchQueryLength)
        : undefined;

    return {
      schemaVersion: 1,
      eventId: createFoleonEventId(),
      eventName,
      eventVersion: 1,
      occurredAtUtc: now().toISOString(),
      correlationId: params.correlationId,
      sessionId: params.sessionId,
      route,
      pageContext,
      ...(typeof partial?.foleonDocId === 'number' && Number.isFinite(partial.foleonDocId)
        ? { foleonDocId: partial.foleonDocId }
        : {}),
      ...(typeof partial?.contentRegistryItemId === 'number' &&
      Number.isFinite(partial.contentRegistryItemId)
        ? { contentRegistryItemId: partial.contentRegistryItemId }
        : {}),
      ...(partial?.gateResult ? { gateResult: partial.gateResult } : {}),
      ...(partial?.originHash ? { originHash: partial.originHash } : {}),
      ...(errorCode ? { errorCode } : {}),
      ...(typeof searchQueryLength === 'number' ? { searchQueryLength } : {}),
      packageVersion: params.packageVersion,
      manifestId: params.manifestId,
      privacyClass: 'telemetry-minimal',
    };
  };

  const emit = (
    eventName: FoleonEventType,
    partial?: FoleonTelemetryEmitInput,
  ): void => {
    const envelope = buildEnvelope(eventName, partial);
    void params.sink.send(envelope).catch(onError);
  };

  return { emit, buildEnvelope, sinkKind: params.sink.kind };
}

function pageContextFromRoute(route: FoleonRoute): FoleonPageContext {
  if (route === 'reader') return 'Reader';
  if (route === 'hub') return 'Content Hub';
  return 'Homepage';
}

/**
 * Stable session-id helper backed by `sessionStorage`. Generates a
 * fresh UUID when storage is unavailable or empty. Safe to call on
 * every mount.
 */
export function resolveFoleonSessionId(storageKey = '__hbIntel_foleon_session'): string {
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const existing = window.sessionStorage.getItem(storageKey);
      if (existing && existing.length > 0) return existing;
      const next = createFoleonEventId();
      window.sessionStorage.setItem(storageKey, next);
      return next;
    }
  } catch {
    // sessionStorage may throw in strict privacy modes; fall through.
  }
  return createFoleonEventId();
}

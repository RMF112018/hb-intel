import type { FoleonGateReason } from './foleon-runtime.types.js';
import type { FoleonRoute } from '../runtime/foleonRuntimeContract.js';

export type FoleonEventType =
  | 'Card Impression'
  | 'Card Click'
  | 'Reader Open'
  | 'Reader Close'
  | 'External Open'
  | 'Embed Error'
  | 'Search'
  | 'Filter';

export type FoleonPageContext =
  | 'Homepage'
  | 'Content Hub'
  | 'Reader'
  | 'Project Site'
  | 'Project Spotlight'
  | 'Company Pulse'
  | 'Leadership Message';

/**
 * Bounded enum of error codes reported via telemetry. Callsites may only
 * emit one of these values; the emitter rejects unknown codes.
 */
export type FoleonErrorCode =
  | 'reader.embed_error'
  | 'reader.gate_blocked'
  | 'reader.config_incomplete'
  | 'content.fetch_failed'
  | 'hub.search_failed';

/**
 * Privacy class tag carried on every envelope. `telemetry-minimal` means:
 * no raw URLs, no search text, no user PII, no auth headers, no raw
 * postMessage payloads. Redaction is centralized in the emitter.
 */
export type FoleonPrivacyClass = 'telemetry-minimal';

/**
 * Whitelist of fields a callsite may pass to `emitter.emit()`. Anything
 * outside this set is dropped at envelope-build time. Note that raw
 * search text is intentionally absent — callsites must pass
 * `searchQueryLength` instead.
 */
export interface FoleonTelemetryEmitInput {
  readonly foleonDocId?: number;
  readonly contentRegistryItemId?: number;
  readonly pageContext?: FoleonPageContext;
  readonly gateResult?: FoleonGateReason;
  readonly errorCode?: FoleonErrorCode;
  readonly searchQueryLength?: number;
  readonly originHash?: string;
}

/**
 * The outbound envelope dispatched to the active event sink. Shape is
 * stable and versioned; the backend team can rely on `schemaVersion` +
 * `eventVersion` to evolve independently.
 */
export interface FoleonTelemetryEnvelope {
  readonly schemaVersion: 1;
  readonly eventId: string;
  readonly eventName: FoleonEventType;
  readonly eventVersion: 1;
  readonly occurredAtUtc: string;
  readonly correlationId: string;
  readonly sessionId: string;
  readonly route: FoleonRoute;
  readonly pageContext: FoleonPageContext;
  readonly foleonDocId?: number;
  readonly contentRegistryItemId?: number;
  readonly gateResult?: FoleonGateReason;
  readonly originHash?: string;
  readonly errorCode?: FoleonErrorCode;
  readonly searchQueryLength?: number;
  readonly packageVersion: string;
  readonly manifestId: string;
  readonly privacyClass: FoleonPrivacyClass;
}

/**
 * Legacy interaction-event shape. Retained for the SharePoint-sink
 * mapper only; new code should use `FoleonTelemetryEnvelope`.
 * `searchQuery` is preserved here for backward compatibility but the
 * emitter never populates it — redaction happens at envelope build.
 */
export interface FoleonInteractionEvent {
  readonly eventId: string;
  readonly eventType: FoleonEventType;
  readonly foleonDocId?: number;
  readonly contentRegistryItemId?: number;
  readonly pageContext?: FoleonPageContext;
  readonly searchQuery?: string;
  readonly eventTimestamp: string;
  readonly sessionId?: string;
}

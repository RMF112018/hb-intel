/**
 * Transport abstraction for Foleon telemetry.
 *
 * Three implementations are provided:
 *  - `sharepoint` — MVP sink that writes to HB_FoleonInteractionEvents
 *    via SharePoint REST with a request digest. Indexed fields land on
 *    the corresponding list columns; the full governed envelope is
 *    serialized into `ClientInfoJson` for support query.
 *  - `backend`   — stub for the future `POST /api/foleon/events` route.
 *    Ships ready to light up without any route-component changes.
 *  - `noop`      — used in mock host mode or when the events list GUID
 *    is absent; preserves the best-effort "never block the user" rule.
 *
 * Sinks throw on failure. Upstream callers (the emitter) swallow the
 * rejection so telemetry stays best-effort.
 */
import {
  fetchRequestDigest,
  type SharePointListDescriptor,
} from '@hbc/sharepoint-platform';
import { assertValidListGuid } from '../schema/validateListGuid.js';
import type { FoleonTelemetryEnvelope } from '../types/foleon-event.types.js';

export const FOLEON_EVENTS_TITLE = 'HB_FoleonInteractionEvents' as const;

export type FoleonEventSinkKind = 'sharepoint' | 'backend' | 'noop';

export interface FoleonEventSink {
  readonly kind: FoleonEventSinkKind;
  send(envelope: FoleonTelemetryEnvelope): Promise<void>;
}

// ──────────────────────────────────────────────────────────────────────
// SharePoint sink (MVP)
// ──────────────────────────────────────────────────────────────────────

export interface FoleonSharePointSinkParams {
  readonly siteUrl: string;
  readonly eventsListId: string;
  /**
   * Optional transport overrides for testing. Default: global fetch +
   * the platform's request-digest helper.
   */
  readonly fetchImpl?: typeof fetch;
  readonly fetchDigest?: (siteUrl: string) => Promise<string>;
}

export function createSharePointEventSink(
  params: FoleonSharePointSinkParams,
): FoleonEventSink {
  assertValidListGuid(params.eventsListId, FOLEON_EVENTS_TITLE);
  const descriptor: SharePointListDescriptor = {
    id: params.eventsListId,
    title: FOLEON_EVENTS_TITLE,
    urlSegment: FOLEON_EVENTS_TITLE,
  };
  const endpoint = `${params.siteUrl}/_api/web/lists(guid'${descriptor.id}')/items`;
  const fetchFn = params.fetchImpl ?? fetch;
  const digestFn = params.fetchDigest ?? fetchRequestDigest;

  return {
    kind: 'sharepoint',
    async send(envelope: FoleonTelemetryEnvelope): Promise<void> {
      const body = mapEnvelopeToSharePointRow(envelope);
      const digest = await digestFn(params.siteUrl);
      const response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
        },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        throw new Error(
          `${FOLEON_EVENTS_TITLE} write failed: ${response.status} ${response.statusText}`,
        );
      }
    },
  };
}

/**
 * Maps the governed envelope onto the `HB_FoleonInteractionEvents`
 * row. Indexed columns receive values from the envelope's indexed
 * fields; the remaining envelope (minus duplicates of indexed columns
 * and minus any raw-text fields) is serialized into `ClientInfoJson`
 * for support query. Raw search text is never written.
 */
export function mapEnvelopeToSharePointRow(
  envelope: FoleonTelemetryEnvelope,
): Record<string, unknown> {
  const clientInfo = {
    schemaVersion: envelope.schemaVersion,
    eventVersion: envelope.eventVersion,
    correlationId: envelope.correlationId,
    route: envelope.route,
    gateResult: envelope.gateResult,
    errorCode: envelope.errorCode,
    originHash: envelope.originHash,
    searchQueryLength: envelope.searchQueryLength,
    packageVersion: envelope.packageVersion,
    manifestId: envelope.manifestId,
    privacyClass: envelope.privacyClass,
  };
  return {
    Title: `${envelope.eventName} ${envelope.foleonDocId ?? ''}`.trim(),
    EventId: envelope.eventId,
    EventType: envelope.eventName,
    FoleonDocId: envelope.foleonDocId ?? null,
    ContentRegistryItemId: envelope.contentRegistryItemId ?? null,
    PageContext: envelope.pageContext,
    SearchQuery: null,
    EventTimestamp: envelope.occurredAtUtc,
    SessionId: envelope.sessionId,
    ClientInfoJson: JSON.stringify(clientInfo),
  };
}

// ──────────────────────────────────────────────────────────────────────
// Backend sink (ready for POST /api/foleon/events)
// ──────────────────────────────────────────────────────────────────────

export interface FoleonBackendSinkParams {
  /**
   * Absolute base URL of the backend host (e.g. the Azure Functions
   * host). The sink posts to `${baseUrl}/api/foleon/events`.
   */
  readonly baseUrl: string;
  readonly fetchImpl?: typeof fetch;
}

export function createBackendEventSink(
  params: FoleonBackendSinkParams,
): FoleonEventSink {
  const endpoint = `${stripTrailingSlash(params.baseUrl)}/api/foleon/events`;
  const fetchFn = params.fetchImpl ?? fetch;
  return {
    kind: 'backend',
    async send(envelope: FoleonTelemetryEnvelope): Promise<void> {
      const response = await fetchFn(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(envelope),
      });
      if (!response.ok) {
        throw new Error(
          `foleon backend events write failed: ${response.status} ${response.statusText}`,
        );
      }
    },
  };
}

function stripTrailingSlash(value: string): string {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

// ──────────────────────────────────────────────────────────────────────
// No-op sink (mock mode / missing config)
// ──────────────────────────────────────────────────────────────────────

export function createNoopEventSink(): FoleonEventSink {
  return {
    kind: 'noop',
    async send(): Promise<void> {
      return;
    },
  };
}

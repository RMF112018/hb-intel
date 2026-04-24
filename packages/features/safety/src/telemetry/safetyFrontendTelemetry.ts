/**
 * Safety frontend telemetry seam.
 *
 * Emits structured lifecycle events for Safety command paths (preview,
 * ingest, replay) and the runtime-binding gate. Events carry the
 * `frontendRequestId` the client generates and the backend-echoed
 * `requestId` so support can join client-side traces to backend
 * Application Insights records via the existing `X-Request-Id` header
 * contract.
 *
 * Why this module exists:
 *   - Backend telemetry already keys on `requestId`; the browser had no
 *     governed event stream, only ad-hoc `console.log` calls.
 *   - W3C `traceparent` is intentionally not used: the backend
 *     middleware does not parse it today (see
 *     `backend/functions/src/middleware/request-id.ts`). Adding it now
 *     would be cosmetic. Correlation rides on `X-Request-Id` only.
 *   - The Application Insights browser SDK is intentionally not added;
 *     there is no AI ingest endpoint wired to the browser. The default
 *     sink is a structured `console.log` payload that mirrors the
 *     backend's `_telemetryType: 'customEvent'` shape so a future Azure
 *     Monitor sink can swap in without touching call sites.
 *
 * Redaction: property names matching the deny-list pattern are replaced
 * with `[REDACTED]` before the sink is invoked. Call sites must extract
 * safe scalar fields — never hand a raw `Error` object or unsanitized
 * request body to this module.
 */

export type SafetyFrontendOperation = 'preview' | 'ingest' | 'replay';

export type SafetyFrontendLifecycle =
  | 'start'
  | 'attempt'
  | 'complete'
  | 'failed'
  | 'cancelled'
  | 'gate-validated'
  | 'gate-blocked';

export interface SafetyFrontendTelemetryEvent {
  readonly name: string;
  readonly timestamp: string;
  readonly operation?: SafetyFrontendOperation | 'runtime-binding';
  readonly lifecycle?: SafetyFrontendLifecycle;
  readonly frontendRequestId?: string;
  readonly requestId?: string;
  readonly properties?: Record<string, unknown>;
}

export type SafetyFrontendTelemetrySink = (event: SafetyFrontendTelemetryEvent) => void;

const REDACT_PATTERN = /token|jwt|bearer|secret|password|filecontent|workbook|payload|rawchecklist|authorization/i;
const REDACTED = '[REDACTED]';

const consoleSink: SafetyFrontendTelemetrySink = (event) => {
  // Mirrors backend logger shape so support tools can normalize across
  // both sides. `_telemetryType: 'customEvent'` is the same key the
  // Azure Functions logger stamps; downstream pipelines key on it.
  const payload = {
    level: 'info',
    _telemetryType: 'customEvent',
    name: event.name,
    timestamp: event.timestamp,
    operation: event.operation,
    lifecycle: event.lifecycle,
    requestId: event.requestId,
    frontendRequestId: event.frontendRequestId,
    ...event.properties,
  };
  // eslint-disable-next-line no-console -- governed structured emission
  console.log(JSON.stringify(payload));
};

let activeSink: SafetyFrontendTelemetrySink = consoleSink;

export function setSafetyFrontendTelemetrySink(sink: SafetyFrontendTelemetrySink): void {
  activeSink = sink;
}

export function resetSafetyFrontendTelemetrySink(): void {
  activeSink = consoleSink;
}

export interface EmitSafetyFrontendEventInput {
  readonly name: string;
  readonly operation?: SafetyFrontendOperation | 'runtime-binding';
  readonly lifecycle?: SafetyFrontendLifecycle;
  readonly frontendRequestId?: string;
  readonly requestId?: string;
  readonly properties?: Record<string, unknown>;
  readonly timestamp?: string;
}

export function emitSafetyFrontendEvent(input: EmitSafetyFrontendEventInput): void {
  const event: SafetyFrontendTelemetryEvent = {
    name: input.name,
    timestamp: input.timestamp ?? new Date().toISOString(),
    operation: input.operation,
    lifecycle: input.lifecycle,
    frontendRequestId: input.frontendRequestId,
    requestId: input.requestId,
    properties: input.properties ? sanitizeProperties(input.properties) : undefined,
  };
  try {
    activeSink(event);
  } catch {
    // Telemetry must never throw into call sites. Swallow sink errors.
  }
}

function sanitizeProperties(props: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (REDACT_PATTERN.test(key)) {
      out[key] = REDACTED;
      continue;
    }
    out[key] = sanitizeValue(value);
  }
  return out;
}

function sanitizeValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((entry) => sanitizeValue(entry));
  }
  if (typeof value === 'object') {
    return sanitizeProperties(value as Record<string, unknown>);
  }
  // Functions, symbols, bigints — drop. Telemetry must be JSON-serializable.
  return undefined;
}

# Safety frontend telemetry reference

Governed lifecycle events emitted by the Safety browser surface, the IDs they carry, and how to correlate them with backend Application Insights.

## Why this exists

The backend emits a structured `safety.ingestion.*` stream keyed on `requestId` (see `safety-ingest-telemetry-reference.md`). Until this seam, the browser had no governed event stream — only ad-hoc `console.log`. Frontend telemetry now mirrors the backend's `_telemetryType: 'customEvent'` shape so support can join client-side and server-side traces by `requestId`.

## Correlation IDs

| ID | Where it is born | Where it travels |
| --- | --- | --- |
| `frontendRequestId` | `SafetyBackendCommandClient` per call (UUID v4 if `crypto.randomUUID` is available, else `safety-<ts>-<rand>`). | Sent in the `X-Request-Id` request header to the backend; emitted on every Safety frontend event. |
| `requestId` (a.k.a. `backendRequestId`) | Backend echoes the client header back, or generates one if none was supplied (see `backend/functions/src/middleware/request-id.ts`). | Read from the `X-Request-Id` response header; emitted on `command.complete` / `command.failed` and surfaced in `SafetyBackendCommandError`. |

Backend events stamp `requestId` on every record. Joining `safety.frontend.command.failed { requestId }` to backend `safety.ingestion.request.failed { requestId }` gives the full lifecycle in one query.

### W3C `traceparent` is intentionally deferred

The backend middleware does not parse `traceparent` today, and there is no Application Insights browser SDK wired to an ingest endpoint. Adding W3C trace context now would be cosmetic. To upgrade later, add `traceparent` parsing to `backend/functions/src/middleware/request-id.ts` and a client emitter in this module — the per-call seam in `SafetyBackendCommandClient.postOperation` is the natural attachment point.

## Event catalog

All events carry: `name`, `timestamp` (ISO-8601), `operation`, `lifecycle`, `frontendRequestId` (when applicable), `requestId` (when applicable), and an optional `properties` bag. Property names matching `/token|jwt|bearer|secret|password|filecontent|workbook|payload|rawchecklist|authorization/i` are replaced with `[REDACTED]` before the sink runs.

### Command lifecycle (preview / ingest / replay)

Emitted by `SafetyBackendCommandClient.postOperation` once per command call; the `operation` property is derived from the route (`/ingest/preview` → `preview`, `/replay` → `replay`, otherwise `ingest`).

| Event | Lifecycle | Emitted | Notable properties |
| --- | --- | --- | --- |
| `safety.frontend.command.start` | `start` | At the start of every command, before token acquisition. | `route`, `attempt: 1`, `maxAttempts` |
| `safety.frontend.command.attempt` | `attempt` | Between a retryable failure and the next retry. | `attempt`, `nextDelayMs`, `errorKind`, `httpStatus`, `code` |
| `safety.frontend.command.complete` | `complete` | On 2xx success, after envelope parsing. | `requestId` (backend echo), `attempts`, `durationMs`, `httpStatus: 200` |
| `safety.frontend.command.failed` | `failed` | On terminal non-cancellation failure (auth, contract, transient retry exhaustion, transport, server). | `requestId`, `attempts`, `durationMs`, `httpStatus`, `code`, `errorKind`, `failureClass`, `previewFailureClass` |
| `safety.frontend.command.cancelled` | `cancelled` | When the caller's `AbortSignal` fires before the response settles. Distinguished from timeout via `errorKind`. | `attempts`, `durationMs`, `errorKind: 'aborted'`, `httpStatus: 0`, `code: 'BACKEND_ABORTED'` |

`durationMs` uses `performance.now()` when available, falling back to `Date.now()`.

### Runtime-binding gate

Emitted by `apps/safety/src/App.tsx` once per resolved runtime contract. Re-fires only when the contract's effective fingerprint (host mode + readiness + blocking reasons) changes.

| Event | Lifecycle | Emitted | Notable properties |
| --- | --- | --- | --- |
| `safety.frontend.runtime-binding.validated` | `gate-validated` | When `canInitializeCommands` is true and there are no blocking reasons. | `hostMode`, `hostedGuidOverlayKnown` |
| `safety.frontend.runtime-binding.blocked` | `gate-blocked` | When the surface cannot initialize commands — backend missing, GUID overlay drift, host disabled, etc. | `hostMode`, `hostedGuidOverlayKnown`, `blockingReasons[]` |

These events do not carry a `requestId` — they describe the surface gate, not a specific command call.

## Sink

The default sink is a structured `console.log` JSON payload that mirrors the backend logger shape (`{ level, _telemetryType: 'customEvent', name, ... }`). Tests stub the sink; future infrastructure work can swap in an Azure Monitor / Application Insights browser sink without touching call sites.

```ts
import {
  emitSafetyFrontendEvent,
  resetSafetyFrontendTelemetrySink,
  setSafetyFrontendTelemetrySink,
} from '@hbc/features-safety';

// Production: redirect to a network sink at boot.
setSafetyFrontendTelemetrySink((event) => myObservabilityClient.track(event));

// Tests: capture and assert.
const captured: SafetyFrontendTelemetryEvent[] = [];
setSafetyFrontendTelemetrySink((event) => captured.push(event));
// ... exercise the system ...
resetSafetyFrontendTelemetrySink();
```

The sink is global on purpose — Safety only has one surface per session, and the runtime-binding emit fires before any repository is constructed, so a context-provider sink would race the first event.

## Redaction policy

Call sites must never hand the module raw `Error` objects, request bodies, or auth headers. The module enforces a property-name deny-list (`token`, `jwt`, `bearer`, `secret`, `password`, `filecontent`, `workbook`, `payload`, `rawchecklist`, `authorization`) recursively across nested property bags. Non-serializable values (functions, symbols, bigints) are silently dropped. Sink errors are swallowed so telemetry never throws into call sites.

## Support runbook

When a user reports a Safety issue:

1. Ask the user to copy the `requestId` from the `SupportDetailsPanel` rendered next to the failure (formatted by `apps/safety/src/pages/supportTruth.ts`).
2. Search backend Application Insights for `requestId == "<value>"` — the backend stamps it on every `safety.ingestion.*` record across the entire pipeline (entry, parse start, evaluation, gate, completion / failure).
3. Search the browser console capture (or whatever sink is configured) for the same `requestId`. Frontend records show the full client-side lifecycle including retries, abort, and duration.
4. If the failure surfaced before any backend command was issued — for example, a runtime-binding block — there is no `requestId`; instead correlate by `safety.frontend.runtime-binding.blocked { hostMode, blockingReasons }`.

## Where this is enforced

- Module: `packages/features/safety/src/telemetry/safetyFrontendTelemetry.ts`
- Module tests: `packages/features/safety/src/telemetry/safetyFrontendTelemetry.test.ts`
- Command emits: `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.ts` (`postOperation`)
- Command emit tests: `packages/features/safety/src/adapters/sharepoint/SafetyBackendCommandClient.test.ts` (`SafetyBackendCommandClient — frontend telemetry correlation`)
- Runtime-binding emit: `apps/safety/src/App.tsx`
- Backend correlation source: `backend/functions/src/services/safety-ingestion-telemetry.ts` and `safety-ingest-telemetry-reference.md`

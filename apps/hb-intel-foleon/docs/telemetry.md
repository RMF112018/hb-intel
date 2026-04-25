# Foleon Telemetry — event schema, privacy posture, sink transition

Authoritative reference for the Foleon web part's interaction telemetry.
Aimed at support engineers, the backend team, and marketing analytics.

## Purpose

Telemetry here is best-effort by design:

- It must never block the user.
- It must never carry raw URLs, search text, user PII, auth headers, or
  raw `postMessage` payloads.
- It must be strong enough to diagnose support tickets (Reader didn't
  load, Hub search looked broken) and rich enough for marketing to
  understand publication engagement.

## Architecture

Three pieces, with a clean seam between them:

1. **Emitter** (`FoleonTelemetryEmitter`) — the single entry point that
   routes/components call. Builds a typed envelope, applies redaction,
   swallows sink failures.
2. **Envelope** (`FoleonTelemetryEnvelope`) — the outbound record. Stable
   shape, schema-versioned, privacy-classed.
3. **Sink** (`FoleonEventSink`) — transport. Three implementations ship:
   `sharepoint` (MVP), `backend` (stub for `POST /api/foleon/events`),
   `noop` (mock mode / missing events list).

Route components never see the sink. Switching from SharePoint to the
backend is a one-line change in `mount.tsx` — see
[Sink transition](#sink-transition).

## Event catalog

| Event name        | Trigger                                             | Typical partial fields                                                                              |
| ----------------- | --------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `Card Impression` | Highlights page renders cards                       | `foleonDocId`, `contentRegistryItemId`                                                              |
| `Card Click`      | User clicks a card to open the Reader               | `foleonDocId`, `contentRegistryItemId`                                                              |
| `Reader Open`     | Reader gate passes and iframe loads                 | `foleonDocId`, `contentRegistryItemId`, `pageContext: 'Reader'`, `gateResult`                       |
| `Reader Close`    | Reader unmounts after a successful open             | `foleonDocId`, `contentRegistryItemId`, `pageContext: 'Reader'`, `gateResult`                       |
| `Embed Error`     | `<iframe>` fires `error`, or Reader gate blocks     | `foleonDocId?`, `contentRegistryItemId?`, `gateResult`, `errorCode`                                 |
| `External Open`   | User clicks "Open externally" or `External Open` card | `foleonDocId`, `contentRegistryItemId`                                                            |
| `Search`          | Content Hub search emits a non-empty trimmed query  | `searchQueryLength` (never the text), `pageContext: 'Content Hub'`                                  |
| `Filter`          | Reserved for future Content Hub filter events       | TBD                                                                                                 |

## Preview fallback telemetry posture

The `1.0.17.0` preview fallback is intentionally non-telemetry-producing:

- Preview records are not `FoleonContentRecord` objects and are not
  passed to live card, reader, external-open, or telemetry paths.
- Highlights and Hub preview cards do not emit `Card Impression`,
  `Card Click`, `Reader Open`, `Reader Close`, `Embed Error`, or
  `External Open` events.
- Empty-registry Content Hub search updates local UI state only and
  does not call the telemetry-facing `onSearch` prop.
- Content Hub search against a live registry still emits the normal
  `Search` telemetry envelope with only `searchQueryLength`; raw search
  text remains excluded.
- Manager preview guidance is read-only and does not call sync,
  placement, reader/open/external, or telemetry workflows.

## Envelope reference

`FoleonTelemetryEnvelope` is the shape sent to the active sink:

| Field                   | Type                                   | Source                                             | Notes                                                                 |
| ----------------------- | -------------------------------------- | -------------------------------------------------- | --------------------------------------------------------------------- |
| `schemaVersion`         | `1`                                    | Emitter                                            | Bump when the envelope shape changes incompatibly                     |
| `eventId`               | string                                 | `createFoleonEventId()` (UUID or fallback)         | Unique per event                                                      |
| `eventName`             | `FoleonEventType`                      | Callsite                                           | Controlled enum                                                       |
| `eventVersion`          | `1`                                    | Emitter                                            | Per-event-name schema version                                         |
| `occurredAtUtc`         | ISO string                             | Emitter (`now().toISOString()`)                    | UTC                                                                   |
| `correlationId`         | string                                 | `mount.tsx` — per-mount UUID                       | Groups events from one web-part lifetime                              |
| `sessionId`             | string                                 | `sessionStorage` `__hbIntel_foleon_session`        | Stable per browser session                                            |
| `route`                 | `highlights` / `reader` / `hub`        | Live getter on the current FoleonApp nav state     |                                                                       |
| `pageContext`           | `Homepage` / `Content Hub` / `Reader`  | Derived or override                                |                                                                       |
| `foleonDocId`           | number (optional)                     | Callsite                                           | Dropped when non-finite                                               |
| `contentRegistryItemId` | number (optional)                     | Callsite                                           | Dropped when non-finite                                               |
| `gateResult`            | `FoleonGateReason` (optional)         | Reader route                                       | Supports open, close, embed error, gate block                         |
| `originHash`            | string (optional)                     | Caller via `fingerprintString(origin)`             | Short non-cryptographic fingerprint; never the full URL               |
| `errorCode`             | `FoleonErrorCode` (optional)          | Callsite                                           | Unknown values dropped                                                |
| `searchQueryLength`     | number (optional)                     | Content Hub search                                 | Length only; raw text never carried                                   |
| `packageVersion`        | string                                 | `FOLEON_PACKAGE_VERSION`                           | Ties each event to a deploy                                           |
| `manifestId`            | string                                 | `FOLEON_WEBPART_ID`                                | Ties each event to a webpart identity                                 |
| `privacyClass`          | `telemetry-minimal`                    | Emitter                                            | Constant tag; downstream sinks may assert                             |

## Privacy posture

Redaction is centralized in `createFoleonTelemetryEmitter`'s
`buildEnvelope`. The rules:

1. Callers pass a whitelist (`FoleonTelemetryEmitInput`). Anything
   outside the whitelist is dropped at envelope-build time. Raw search
   text is **not** in the whitelist.
2. `errorCode` is clamped to a known enum (`FoleonErrorCode`). Unknown
   values are dropped.
3. `searchQueryLength` is coerced to a finite non-negative integer or
   dropped.
4. `foleonDocId` and `contentRegistryItemId` must be finite numbers or
   they are dropped.
5. `originHash` is an opaque string from `fingerprintString` — never a
   full URL.
6. The SharePoint sink writes `SearchQuery: null` in every row,
   regardless of envelope contents. The full governed envelope goes
   into `ClientInfoJson`.

The goal: a tenant admin reviewing
`HB_FoleonInteractionEvents` sees aggregate-shaped signals only; no
individual user's search text or authoring paths.

## MVP SharePoint sink

Writes one list item to `HB_FoleonInteractionEvents` per `emit()`:

- Endpoint: `<siteUrl>/_api/web/lists(guid'<eventsListId>')/items`.
- Request digest obtained via `@hbc/sharepoint-platform::fetchRequestDigest`.
- Headers: `Accept` / `Content-Type` as `application/json;odata=nometadata`,
  plus `X-RequestDigest`.
- Failures throw; the emitter swallows.
- Retention: per list schema doc; noisy events are the tradeoff for a
  zero-backend MVP.

Schema fields populated:

- Indexed: `EventId`, `EventType`, `FoleonDocId`,
  `ContentRegistryItemId`, `PageContext`, `EventTimestamp`,
  `SessionId`.
- Title (human-scannable): `"${eventName} ${foleonDocId ?? ''}"`.
- `SearchQuery`: always `null` — privacy rule.
- `ClientInfoJson`: stringified `{ schemaVersion, eventVersion,
  correlationId, route, gateResult, errorCode, originHash,
  searchQueryLength, packageVersion, manifestId, privacyClass }`.
- `UserEmailHash`, `UserDepartment`, `FilterStateJson`, `ReferrerPath`
  remain unused at MVP. They belong to the backend-enriched path.

## Sink transition

To flip the sink to the backend — once `POST /api/foleon/events` is
available — edit `apps/hb-intel-foleon/src/FoleonApp.tsx` `selectSink`:

```ts
function selectSink(contract: IFoleonRuntimeContract): FoleonEventSink {
  if (contract.hostMode !== 'sharepoint' || !contract.siteUrl) {
    return createNoopEventSink();
  }
  return createBackendEventSink({ baseUrl: contract.siteUrl });
}
```

Route components and the emitter do not change. A feature flag on the
runtime contract can gate this switch if a staged rollout is desired.

Backend responsibilities once live:

- Authenticate the caller (SharePoint bearer / on-behalf flow).
- Enrich envelope with server-side fields (user department hash,
  referrer path, request id).
- Validate `schemaVersion` / `eventVersion`.
- Store to a durable sink decoupled from SharePoint list limits.

## Failure posture

- Every sink `send()` is called with `.catch(onError)`. Route
  components never see a rejected promise.
- `onError` defaults to silent. In development, wire a console logger
  via `createFoleonTelemetryEmitter({ onError: console.warn, ... })`
  if verbose diagnosis is needed.
- The runtime-binding proof published at
  `window.__hbIntel_foleonRuntimeBindingProof.presence.eventsListId`
  confirms whether the events list was configured — a `false` there
  explains silent telemetry.

## Troubleshooting

| Symptom                                       | Likely cause                                                          | How to check                                                                                                      |
| --------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| No events appearing at all                    | Mock mode, missing `eventsListId`, or blocked by gate `canInitialize` | `window.__hbIntel_foleonRuntimeBindingProof.presence.eventsListId` / `canInitialize`                              |
| Events appearing for some users, not others   | Request digest refresh failed; SharePoint list write rejected         | Browser devtools Network; look for 4xx on `/_api/web/lists(guid'...')/items`                                      |
| `SearchQuery` column populated with text      | Legacy build before 1.0.5.0                                           | `packageVersion` on the row: must be `>=1.0.5.0`. If not, redeploy                                                |
| Duplicate events per card load                | Multiple mounts of the web part on one page                           | Compare `correlationId` — identical IDs inside a single session imply the same mount is firing twice              |
| High cardinality of `correlationId`           | Expected; per-mount IDs differ from per-session IDs                   | Group by `sessionId` for per-user work, `correlationId` for debugging individual web-part lifetimes               |

## References

- Schema: `docs/reference/sharepoint/list-schemas/hbcentral/lists/hb-foleon-interaction-events.md`
- Audit: `docs/architecture/plans/MASTER/spfx/foleon/phase-01/audit-reports/06-Telemetry-Observability-Supportability-Assessment.md`
- Source: `apps/hb-intel-foleon/src/services/FoleonTelemetryEmitter.ts`, `FoleonEventSink.ts`, `types/foleon-event.types.ts`
- Runtime identity: `apps/hb-intel-foleon/src/mount.tsx` (`correlationId`, `sessionId` generation)

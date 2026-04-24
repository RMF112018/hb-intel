# Safety Ingest Telemetry Reference

Stable reference catalog for Safety ingest telemetry emitted by `@hbc/functions`. Consumed by operators, the Safety ingest runbook, and any future ops tooling. **This is a reference, not a runbook** — no procedures here. For triage and recovery, see `docs/maintenance/safety-ingest-triage-and-recovery-runbook.md`.

## Stamping

Every `safety.ingestion.*` event is emitted through `backend/functions/src/services/safety-ingestion-telemetry.ts` and is stamped with:

| Key | Source |
| --- | --- |
| `backendVersion` | `resolveBackendArtifactIdentity().version` (see `backend/functions/src/utils/backend-version.ts`) — CI-stamped `HBC_FUNCTIONS_BUILD_VERSION` env, else `@hbc/functions/package.json` |
| `requestId` | Caller `X-Request-Id` header or generated UUID |
| `operation` | `'ingest' \| 'preview' \| 'replay'` |
| `runId` / `parentRunId` | Canonical correlation IDs for the ingestion run |
| `attemptNumber` | Retry attempt counter (1 for first attempt) |
| `timestamp` | ISO-8601 UTC, set at emit time |

The `backendVersion` field is the single truth for artifact correlation — every Kusto query for a Safety failure should `summarize ... by tostring(customDimensions.backendVersion)` when artifact drift is suspected.

## Event catalog

Grouped by lane. Only event names that exist in source are listed.

### Application service lane (`backend/functions/src/services/safety-ingestion-application-service.ts`)

| Event name | When it fires | Key properties |
| --- | --- | --- |
| `safety.ingestion.entry` | Operation start (ingest / replay / preview) | `codePath`, `backendVersion` |
| `safety.ingestion.request.received` | Request accepted at application-service boundary | `fileName`, `reportingPeriodId`, `uploadedByUpn` |
| `safety.ingestion.preview.parse.start` | Preview parse initiated | `fileName`, `reportingPeriodId` |
| `safety.ingestion.preview.evaluated` | Preview evaluation complete | `commitReadiness`, `blockingCodes`, `warningCodes`, `duplicateRisk` |
| `safety.ingestion.contract.validation.result` | Template contract check result | `valid`, `templateVersion`, `parserContractVersion` |
| `safety.ingestion.reporting-period.resolution.result` | Reporting period lookup result | `resolved`, `dateInRange`, `reportingPeriodId` |
| `safety.ingestion.project-resolution.result` | Project resolution outcome | `resolved`, `classification`, `projectNumber` |
| `safety.ingestion.duplicate.classification` | Duplicate risk assessment | `confidence`, `matchedInspectionEventId`, `supersessionRisk` |
| `safety.ingestion.commit.gate.blocked` | Preview gate rejected commit | `fileName`, `readiness`, `blockingCodes`, `duplicateRisk` |
| `safety.ingestion.commit.gate.allowed` | Preview gate passed | `fileName`, `readiness`, `duplicateRisk` |
| `safety.ingestion.request.completed` | Ingest succeeded | `state`, `runSpItemId`, `reportingPeriodId` |
| `safety.ingestion.request.failed` | Ingest failed | `failureClass`, `errorCode`, `graphOperation`, `graphStatus`, `authLane` |
| `safety.ingestion.replay.request.received` | Replay request entry | `supersedePrior` |
| `safety.ingestion.replay.request.completed` | Replay succeeded | `state`, `runSpItemId` |
| `safety.ingestion.replay.request.failed` | Replay failed | `failureClass`, `errorCode` |
| `safety.ingestion.preview.request.received` | Preview request entry | — |
| `safety.ingestion.preview.request.completed` | Preview succeeded | `diagnosticSummary` |
| `safety.ingestion.preview.request.failed` | Preview failed | `failureClass`, `errorCode` |
| `safety.ingestion.graph.overlay.failed` | List GUID overlay resolution failed | `failureClass`, `hbCentralSiteUrl`, `safetySiteUrl` |

### Graph repository lane (`backend/functions/src/services/safety-ingestion-graph-repository.ts`)

| Event name | When it fires | Key properties |
| --- | --- | --- |
| `safety.ingestion.pipeline.stage` | Pipeline stage transition | `stage`, `status`, `state`, `runId`, `attemptNumber` |
| `safety.ingestion.idempotency.short-circuit` | Duplicate short-circuited | `matchedInspectionEventId` |
| `safety.ingestion.duplicate.review-required` | Duplicate flagged for review | `duplicateConfidence`, `matchedInspectionEventId` |
| `safety.ingestion.duplicate.supersession` | Duplicate superseded | `supersededPriorId` |
| `safety.ingestion.reporting-period.read.start` | Reporting-period query initiated | `siteUrl`, `listId`, `itemId`, `graphOperation`, `graphPathSummary` |
| `safety.ingestion.reporting-period.read.result` | Reporting-period lookup succeeded | `siteUrl`, `siteId`, `listId`, `found` |
| `safety.ingestion.reporting-period.read.failed` | Reporting-period lookup failed | `failureClass`, `statusCode`, `graphErrorCode`, `causeBucket` |
| `safety.ingestion.graph.concurrency.conflict` | ETag conflict (409 / 412) | `list`, `itemId`, `mutation`, `attempt` |
| `safety.ingestion.graph.concurrency.recovered` | Concurrency retry succeeded (attempt > 1) | `list`, `itemId`, `mutation`, `attempt` |
| `safety.ingestion.graph.concurrency.idempotent` | Idempotent update (no-op) | `list`, `itemId`, `mutation` |
| `safety.ingestion.graph.concurrency.retry-exhausted` | Max concurrency retries exceeded | `list`, `itemId`, `mutation`, `attempts` |

### Graph data-plane lane (`backend/functions/src/services/safety-ingestion-graph-data-plane.ts`)

| Event name | When it fires | Key properties |
| --- | --- | --- |
| `safety.ingestion.graph.site.resolved` | Site ID cache hit / initial resolve | `siteUrl`, `siteId` |
| `safety.ingestion.graph.get-item.failed` | `GET /sites/{id}/lists/{id}/items/{id}` failed | `siteUrl`, `listId`, `itemId`, `statusCode` |
| `safety.ingestion.graph.query.bounded.truncated` | Bounded query truncated | `limit`, `totalSeen` |
| `safety.ingestion.graph.query.bounded` | Bounded query returned | `count` |
| `safety.ingestion.graph.items.listed` | List items query succeeded | `listId`, `count` |
| `safety.ingestion.graph.item.created` | POST item succeeded | `listId`, `itemId` |
| `safety.ingestion.graph.item.updated` | PATCH item succeeded | `listId`, `itemId`, `mutation` |
| `safety.ingestion.graph.file.uploaded` | Upload PUT succeeded | `listId`, `fileName` |
| `safety.ingestion.graph.file.downloaded` | Download GET succeeded | `listId`, `itemId` |
| `safety.ingestion.graph.retry` | Transient-class retry attempt | `attempt`, `statusCode` |
| `safety.ingestion.graph.failure.classified` | **Primary triage event.** A classified Graph failure was observed at the data-plane boundary. | `failureClass`, `statusCode`, `authLane`, `causeBucket`, `graphOperation`, `graphErrorCode` |

## Metric catalog

`emitSafetyIngestionMetric` call sites:

| Metric name | Emit site | Meaning |
| --- | --- | --- |
| `safety.ingestion.duration.ms` | `safety-ingestion-application-service.ts` | End-to-end ingest latency, milliseconds |
| `safety.ingestion.findings.count` | `safety-ingestion-graph-repository.ts` | Findings persisted in a run |

## Failure-class enum

Canonical `failureClass` values emitted on failed events. Produced by the classifier in `backend/functions/src/services/safety-ingestion-failure-classifier.ts` and referenced by both the runbook and dashboard queries.

| `failureClass` | Meaning | Primary emit sites |
| --- | --- | --- |
| `identity-not-acquired` | Managed Identity token acquisition failed | data-plane, application-service |
| `permission-denied-401` | Graph returned 401 (authentication) | data-plane, application-service |
| `permission-denied-403` | Graph returned 403 (authorization / grant missing) | data-plane, application-service |
| `item-binding-error` | List item read or bind failed at a semantic boundary | graph-repository (reporting-period read), application-service |
| `concurrency-conflict` | 409 / 412 ETag conflict on mutation | graph-repository (concurrency path) |
| `preview-gate-blocked` | Parser-authoritative preview gate rejected commit | application-service |

Additional classifier outputs may include `transport-error`, `throttle`, and others observed at the data plane; the canonical, operator-facing list above is the minimum set a runbook must recognize.

## `authLane` enum

Orthogonal to `failureClass`. Names which side of the auth stack surfaced the error.

| `authLane` | Meaning |
| --- | --- |
| `identity` | Token acquisition layer (MI, DefaultAzureCredential) |
| `permission` | Graph returned an authorization error (401 / 403) |
| `transport` | Network / transport fault |

## `causeBucket` enum

Used by `safety.ingestion.reporting-period.read.failed` and adjacent item-binding events to disambiguate binding failures.

| `causeBucket` | Meaning |
| --- | --- |
| `identity/grant` | Caller could not prove identity or lacked grant at the site |
| `site-binding` | Site resolution failed (site does not exist or MI is not granted on it) |
| `list-binding` | List GUID overlay failed — list not found on the site |
| `item-contract` | Item exists but fields do not match the expected schema |
| `item-missing` | Item ID does not exist on the list |
| `unknown` | Classifier could not determine the cause bucket |

## Retention assumptions

- **Application Insights retention:** default **90 days**. Not overridden in Bicep (`infra/**` does not currently declare the App Insights resource for `hb-intel-function-app`). Incidents requiring evidence older than 90 days must export to Log Analytics within the window.
- **Sampling:** `backend/functions/host.json` enables `samplingSettings` at `maxTelemetryItemsPerSecond: 20` with `Exception` excluded from sampling. Under bursty ingest load, high-frequency success events can be sampled; failure classifications are less likely to be sampled away but sampling is not bypassed for specific `failureClass` values today.
- **Log Analytics sink:** not declared in Bicep or the deploy workflow. Extending retention, adding a diagnostic-settings sink, or exempting specific failure classes from sampling are **operational / IaC changes out of scope for this reference**; they are tracked as follow-ups in audit report 17.

## Cross-references

- Runbook: `docs/maintenance/safety-ingest-triage-and-recovery-runbook.md`
- Audit reports: `docs/architecture/plans/MASTER/backend/phase-03/audit-reports/15-Graph-Only-Cutover-Closure.md`, `16-Permissions-Tightening-And-Reproof.md`, `17-Deployment-Proof-And-Operator-Readiness.md`
- Monitoring queries (generic / provisioning): `docs/reference/developer/monitoring-queries.md`
- Health surface guard: `backend/functions/src/test/release-gates.test.ts`
- Deployment-proof guards: `backend/functions/src/utils/deployment-proof.test.ts`

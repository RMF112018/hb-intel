# Admin SPFx IT Control Center — Phase 12 Observability Baseline

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-01/P13-02 — re-audit against current repo truth
**Prerequisite:** P12-01 gap map (`admin-spfx-phase-12-observability-gap-map.md`)

---

## 1. Purpose

This document defines the canonical operating model for admin observability in Phase 12. All subsequent implementation prompts must treat this baseline as the governing contract for where observability responsibilities live, what data categories exist, and what boundary rules apply.

This revision reflects repo truth after Phase 12 execution through P12-09.

---

## 2. Layer responsibilities

### 2.1 Operator console — SPFx (`apps/admin`)

The SPFx app is the **read and interact** surface. It must never own durable state, privileged queries, or observability execution logic.

| Responsibility | Example |
|---------------|---------|
| Render observability data fetched from backend APIs | Alert list, probe dashboard, error log, correlated timelines |
| Accept operator actions and relay them to backend | Acknowledge, resolve, escalate, refresh, filter |
| Poll or subscribe for data freshness | Alert polling (30s), probe polling (15min) |
| Present coaching, empty states, and runbook links | Smart empty states, contextual guidance |
| Gate visibility by complexity tier and permission | `HbcComplexityGate`, `PermissionGate` |

**Current state:**
- `ErrorLogPage` is fully implemented (P12-08) — queries `POST /api/admin/observability/errors` via `useObservabilityErrors()` with domain, severity, and classification filters.
- `OperationalDashboardPage` shows queue health, alert dashboard, and probe dashboard.
- `ProvisioningOversightPage` shows runs with retry/archive/escalate/force-state workflows.
- Alert badge in navigation via `useAdminAlerts()`.
- Root route integrates alert polling (30s) and probe polling (15min).
- All observability routes protected by `adminBeforeLoad()` permission guard.
- Errors lane marked `active` in lane registry.

**Must not:**
- Persist observability data durably (no IndexedDB, no SharePoint writes from the browser).
- Classify failures or evaluate alert rules — these are backend concerns.
- Infer observability state from UI-side heuristics when backend data is available.

### 2.2 Reusable admin-intelligence package — `@hbc/features-admin`

The features-admin package provides **composable hooks, components, and client-side orchestration** for admin observability. It is the reusable layer between the SPFx app and the backend.

| Responsibility | Example |
|---------------|---------|
| React hooks that call backend observability APIs | `useAdminAlerts`, `useInfrastructureProbes`, `useObservabilityErrors` |
| Client-side polling orchestration | Alert polling (30s), probe scheduling (15min) |
| Dashboard and badge components | `AdminAlertDashboard`, `ImplementationTruthDashboard`, `AdminAlertBadge` |
| Monitor registry (client-side execution of lightweight checks) | `MonitorRegistry` with injected `IProvisioningDataProvider` |
| Notification routing logic (severity-to-channel mapping) | `notificationRouter` |
| Integration adapters (ports-and-adapters pattern) | `TeamsWebhookDispatchAdapter` with delivery tracking |

**Current state after Phase 12 execution:**
- `AdminAlertsApi` and `InfrastructureProbeApi` now backed by durable Azure Table Storage (P12-04/P12-05). In-memory `Map` instances serve as local caches; durable state lives in the backend.
- `useObservabilityErrors()` hook implemented (P12-08) — queries backend error store.
- `TeamsWebhookDispatchAdapter` hardened with delivery status tracking, acknowledged-alert suppression, and 5-minute duplicate suppression cooldown (P12-09).
- `resolve()` action added to `AdminAlertsApi` alongside `acknowledge()` (P12-09).
- 3 of 6 monitors wired with real data providers: `provisioningFailureMonitor`, `stuckWorkflowMonitor`, `overdueProvisioningMonitor` (P12-06).
- 3 of 5 probes have corrected behavior: deferred probes return `unknown` instead of misleading `healthy` (P12-06).

**Must not:**
- Own durable persistence — that belongs to the backend.
- Execute privileged queries against Azure resources directly.
- Bypass the backend for observability writes.

### 2.3 Shared domain models — `packages/models`

The models package provides **shared type contracts** used by both the frontend packages and the backend.

| Responsibility | Example |
|---------------|---------|
| Observability event types and enums | `ObservabilityAlertSeverity`, `ObservabilityProbeHealthStatus`, `ObservabilityErrorClassification` |
| Observability record shapes | `IObservabilityAlertRecord`, `IObservabilityProbeSnapshotRecord`, `IObservabilityErrorRecord` |
| Correlation key contracts | `IObservabilityCorrelation` with runId, actionKey, domain |
| Operator action contracts | `IObservabilityOperatorActionRecord` with action types |
| Pagination and summary contracts | `IObservabilityPagedResponse<T>`, `IObservabilityDashboardSummary` |

**Current state:** All Phase 12 model additions are implemented in `packages/models/src/admin-control-plane/`:
- `IObservabilityAlertRecord`, `IObservabilityAlertIngestionPayload`, `IObservabilityAlertQuery`, `IObservabilityAlertSummary`
- `IObservabilityProbeResultRecord`, `IObservabilityProbeSnapshotRecord`, `IObservabilityProbeSnapshotQuery`, `IObservabilityProbeSubmissionPayload`, `IObservabilityProbeHealthSummary`
- `IObservabilityErrorRecord`, `IObservabilityErrorIngestionPayload`, `IObservabilityErrorQuery`
- `IObservabilityIncidentRecord`, `IObservabilityCorrelation`, `IObservabilityOperatorActionRecord`
- `IObservabilityTimelineItem`, `IObservabilityPagedResponse<T>`, `IObservabilityDashboardSummary`
- `ObservabilityEnums.ts` with comprehensive enum coverage (severity, alert status, alert category, affected entity type, probe kind, probe health status, incident status, error classification, error source, operator action type, timeline item kind)

### 2.4 Backend / control plane — `backend/functions`

The backend is the **single durable owner** of all observability state. It ingests, stores, queries, and governs access to observability data.

| Responsibility | Example |
|---------------|---------|
| Durable persistence for alerts, probe snapshots, incidents, errors | Azure Table Storage adapters (`ObservabilityAlerts`, `ObservabilityProbeSnapshots`, `ObservabilityErrors` tables) |
| Ingestion APIs for observability events | Accept alert evaluations, probe results, error events from authorized callers |
| Query APIs for SPFx consumption | List alerts, get probe history, query error log, build correlated timelines |
| Operator action APIs | Acknowledge, resolve — with audit trail |
| Fire-and-forget error emission from route handlers | `observability-emitter.ts` with classification heuristics |
| Cross-domain correlation | Link observability events to run IDs, domains, and action keys |
| Telemetry emission to Application Insights | Structured custom events for operational monitoring |

**Current state after Phase 12 execution:**
- **Observability Error Store** (`observability-error-store.ts`): durable, append-only, domain-partitioned in `ObservabilityErrors` table (P12-01).
- **Observability Alert Store** (`observability-alert-store.ts`): durable, category-partitioned in `ObservabilityAlerts` table with deduplication, severity tracking, and acknowledge/resolve (P12-02).
- **Observability Probe Store** (`observability-probe-store.ts`): probe snapshot persistence (P12-03). Interface defined; full query operations partially implemented.
- **Observability API routes** (`observability-routes.ts`): alerts (list, get, acknowledge, resolve), probes (list), errors (list), dashboard summary, timeline by runId (P12-05).
- **Observability emitter** (`observability-emitter.ts`): fire-and-forget error ingestion from route error handlers.
- **Admin control plane service factory**: observability stores wired (`observabilityAlertStore`, `observabilityProbeStore`, `observabilityErrorStore`).
- **Dashboard service**: interface defined; combined summary assembly partially complete.
- **Timeline service**: interface defined; run correlation/log reconstruction partially complete.

**Must not:**
- Expose raw Table Storage entities to the frontend — always project through typed API contracts.
- Allow unauthenticated or unpermissioned observability writes.

---

## 3. Observability data categories

### 3.1 Alerts

**Definition:** Discrete operator-facing notifications that something requires attention.

| Property | Value |
|----------|-------|
| Current state | **Durable** in `ObservabilityAlerts` Azure Table Storage (P12-04). In-memory `Map` in `AdminAlertsApi` serves as local cache. 3 monitors wired, 3 stubs. |
| Phase 12 remaining | Complete dashboard/timeline service assembly; document deferred monitors in exit report |
| Owner | Backend (persistence + evaluation); features-admin (display + polling) |
| Lifecycle | Created → Active → Acknowledged → Resolved (P12-09 added `resolve()`) |
| Correlation | `alertId`, `category`, `severity`, `affectedEntityId`, `affectedEntityType`, `dedupeKey`, `domain`, `runId` |
| Retention | Operator-facing; retained for audit and trend analysis |

### 3.2 Probe snapshots

**Definition:** Point-in-time infrastructure health assessments.

| Property | Value |
|----------|-------|
| Current state | **Durable** in `ObservabilityProbeSnapshots` Azure Table Storage (P12-05). 2 probes live (`azureFunctionsProbe`, `sharePointProbe`), 3 deferred returning `unknown` (P12-06). |
| Phase 12 remaining | Complete probe store query operations; assess feasible probe connections |
| Owner | Backend (persistence + optional server-side execution); features-admin (client-triggered execution + display) |
| Lifecycle | Captured → Stored → Queryable |
| Correlation | `probeKey`, `snapshotId`, `capturedAt`, `triggerMode` |
| Retention | Time-series; retained for health trend analysis |

### 3.3 Incidents

**Definition:** Correlated groups of related observability events that represent a single operational situation.

| Property | Value |
|----------|-------|
| Current state | Model defined in `packages/models` (`IObservabilityIncidentRecord` with status, correlation, related alert/error IDs). `ObservabilityIncidents` table specified in store layout. Implementation partially complete. |
| Phase 12 remaining | Complete incident persistence adapter; wire incident creation from correlated alerts |
| Owner | Backend (correlation + persistence); features-admin (display) |
| Lifecycle | Opened → Investigating → Resolved → Closed |
| Correlation | `incidentId`, linked `alertIds`, linked `errorIds`, `runId`, `domain` |
| Retention | Operator-facing; retained for post-incident review |

### 3.4 Error events

**Definition:** Discrete error records surfaced on the error log page.

| Property | Value |
|----------|-------|
| Current state | **Durable** in `ObservabilityErrors` Azure Table Storage (P12-01). `ErrorLogPage` fully implemented (P12-08) querying `POST /api/admin/observability/errors` with domain/severity/classification filters. Fire-and-forget error emission from route handlers via `observability-emitter.ts`. |
| Phase 12 remaining | Extend error emission to additional admin domains (P12-07) |
| Owner | Backend (persistence + ingestion + classification); features-admin (`useObservabilityErrors` hook); apps/admin (`ErrorLogPage`) |
| Lifecycle | Occurred → Classified → Recorded → Queryable → (optionally linked to incident) |
| Correlation | `errorId`, `domain`, `source`, `classification`, `severity`, `runId`, `actionKey`, `stepNumber`, `incidentId` |
| Retention | Operator-facing; retained for diagnosis and audit |

### 3.5 Correlated run timeline items

**Definition:** Ordered sequence of events associated with a specific admin run, providing a unified view of what happened.

| Property | Value |
|----------|-------|
| Current state | `AdminAuditStore` has 16 event types; `ProvisioningAuditBridge` emits 11 provisioning event types. Timeline API endpoint defined at `GET /api/admin/observability/timeline/{runId}`. Timeline service interface defined; implementation partially complete. Only provisioning domain wired for event emission. |
| Phase 12 remaining | Complete timeline service implementation; extend event emission to SharePoint control, Entra control, and other admin domains (P12-07) |
| Owner | Backend (persistence + query); features-admin (display) |
| Lifecycle | Emitted → Stored → Queryable as timeline |
| Correlation | `runId`, `auditId`, `domain`, `eventType`, `timestamp` |
| Retention | Append-only; retained for operational and compliance audit |

### 3.6 Operator actions

**Definition:** Records of operator interactions with observability state — acknowledgments, resolutions, escalations.

| Property | Value |
|----------|-------|
| Current state | `acknowledge()` and `resolve()` exist on `AdminAlertsApi` backed by durable storage (P12-09). Provisioning retry/escalate/archive/force-state are real backend actions. `IObservabilityOperatorActionRecord` model defined with action types (alert.acknowledged, alert.resolved, escalated, probe.triggered, incident.*, error.dismissed). |
| Phase 12 remaining | Ensure all operator actions produce durable audit records; complete any missing action types |
| Owner | Backend (persistence + authorization); features-admin (action hooks) |
| Lifecycle | Requested → Authorized → Executed → Audited |
| Correlation | `actionId`, `targetEntityId`, `actorUpn`, `domain`, `actionType` |
| Retention | Append-only audit records; same store as run timeline |

---

## 4. Raw telemetry vs durable operator-facing state

| Category | Raw telemetry | Durable operator-facing state |
|----------|--------------|-------------------------------|
| **Definition** | Unprocessed events emitted by code instrumentation | Normalized, queryable records designed for operator consumption |
| **Examples** | Application Insights custom events (`handler.invoke`, `handler.success`, `handler.error`), `console.warn` output, HTTP request traces | Alert records, probe snapshots, audit events, error log entries |
| **Owner** | Application Insights / Azure Monitor | Backend Azure Table Storage (`Observability*` tables) |
| **Retention** | Platform-managed (90-day default in App Insights) | Application-managed per retention policy |
| **Query surface** | KQL in Azure portal or Log Analytics | Backend query APIs consumed by SPFx |
| **Access** | Azure RBAC (platform team / DevOps) | Application-level permission gates (operator roles) |

**Boundary rule:** Raw telemetry is valuable for debugging and platform monitoring but is not the operator's primary observability surface. Phase 12 ensures that operators see **durable, normalized, application-level records** through SPFx — not raw telemetry views.

The provisioning saga already emits structured telemetry to Application Insights (`ProvisioningSagaStarted`, `ProvisioningStepCompleted`, etc.). These remain valuable as raw telemetry. Phase 12 adds the **operator-facing projection** — the same events, normalized into durable records queryable through the SPFx console. Both write paths are independent and non-blocking.

---

## 5. What must not live only in browser memory

| Data | Original state (Phase 12 entry) | Current state | Status |
|------|--------------------------------|---------------|--------|
| Active and historical alerts | In-memory `Map` in `AdminAlertsApi` | Backend-persisted in `ObservabilityAlerts` table, queried via API | **Satisfied** (P12-04) |
| Probe snapshots and history | In-memory `Map` in `InfrastructureProbeApi` | Backend-persisted in `ObservabilityProbeSnapshots` table, queried via API | **Satisfied** (P12-05) |
| Alert acknowledgment / resolution state | In-memory property on alert record | Backend-persisted with operator audit trail; `resolve()` added (P12-09) | **Satisfied** (P12-09) |
| Error events for the error log | Not stored at all | Backend-persisted in `ObservabilityErrors` table, queried via `ErrorLogPage` | **Satisfied** (P12-08) |
| Notification dispatch status | Fire-and-forget, no record | Delivery status tracking in `TeamsWebhookDispatchAdapter` (P12-09) | **Satisfied** (P12-09) |

**All items that an operator would expect to survive a page reload are now backend-owned.**

---

## 6. Relationship to existing admin-control surfaces

### Provisioning domain (fully wired)
- Provisioning saga emits structured telemetry and terminal-state evidence.
- `ProvisioningAuditBridge` writes to the generalized audit spine (11 event types).
- `ProvisioningOversightPage` displays runs, failures, retry/escalate/archive/force-state actions.
- Durable alert persistence implemented; 3 monitors wired with provisioning data providers.
- Error events emitted from route handlers via `observability-emitter.ts`.

### SharePoint control domain (partially wired)
- `SharePointControlPage` has real operator actions.
- No observability event emission to the audit spine yet.
- **Remaining Phase 12 work:** Add audit bridge for SharePoint control actions (P12-07).

### Entra / identity control domain (partially wired)
- `EntraLanePage` has real operator actions.
- No observability event emission to the audit spine yet.
- **Remaining Phase 12 work:** Add audit bridge for Entra control actions (P12-07).

### Standards configuration domain (partially wired)
- `StandardsConfigPage` has real operator actions.
- Config modification audit events defined in `AdminAuditEventType` but may not yet be emitted.
- **Remaining Phase 12 work:** Verify and complete event emission (P12-07).

### Setup / install domain (fully wired)
- Install runs produce full run/audit/evidence records through the Phase 4 baseline.
- `InstallRunDetailPage` shows step-level diagnostics.
- No Phase 12 rebuild needed — preserved.

### White-glove deployment domain (fully wired within its scope)
- White-glove pages have real operator workflows.
- Run/audit integration follows the Phase 4 pattern.
- Phase 12 preserves this; timeline query extension pending.

### Health / operational dashboard (transitioned)
- `OperationalDashboardPage` shows queue health, bottleneck detection, alert dashboard, probe dashboard.
- Alert and probe data now backend-queried via durable stores (P12-04/P12-05).
- Dashboard summary API endpoint defined; implementation partially complete.

### Error log surface (implemented)
- `ErrorLogPage` fully implemented (P12-08) with backend integration.
- Queries `POST /api/admin/observability/errors` with domain/severity/classification filters.
- Smart empty states distinguish truly empty from filter-empty.
- Lane registry marks Errors as `active`.

---

## 7. Baseline rules for Phase 12 implementation

1. **Backend owns all durable observability state.** No exceptions. **Status: enforced** — all observability stores are backend-owned Azure Table Storage.
2. **SPFx reads and interacts; it does not persist.** In-memory stores in `features-admin` serve as local caches only. **Status: enforced** — hooks query backend APIs.
3. **`packages/models` carries all shared type contracts.** Both frontend and backend import from models. **Status: enforced** — comprehensive observability contracts in place.
4. **Extend, do not replace, healthy Phase 4 foundations.** `AdminRunStore`, `AdminAuditStore`, `AdminEvidenceStore`, and the `ProvisioningAuditBridge` pattern are the templates. **Status: followed** — new stores follow the Phase 4 adapter pattern.
5. **New observability stores follow the Phase 4 adapter pattern.** Azure Table Storage with partition/row key design, typed adapters. **Status: followed** — `ObservabilityAlertStore`, `ObservabilityErrorStore`, `ObservabilityProbeStore` all use this pattern.
6. **Alert evaluation may run client-side or server-side**, but alert state must be written to the backend. **Status: enforced** — monitors run client-side, results persisted to backend.
7. **Probe execution may be client-triggered**, but probe results must be written to the backend. **Status: enforced** — probe results persisted to backend.
8. **All operator actions against observability state must produce audit records.** **Status: partially enforced** — `acknowledge()` and `resolve()` are backend-persisted; remaining action types pending verification.
9. **Cross-domain correlation uses `runId`, `domain`, and `actionKey`** as the primary correlation keys, consistent with the existing audit spine. **Status: enforced** — all observability contracts use these keys.
10. **ErrorLogPage is a real surface** querying backend error/audit event APIs. **Status: complete** (P12-08).

---

## Validation

- [x] Baseline does not contradict P12-01 gap map findings (updated gap map)
- [x] Layer responsibilities match the governing end-state plan (SPFx = console, backend = control plane)
- [x] No responsibility implies browser-owned durability
- [x] Data categories cover all identified limitations
- [x] Relationship to existing surfaces is grounded in verified repo state
- [x] Phase 12 progress accurately reflected for each data category
- [x] Remaining work clearly identified per category

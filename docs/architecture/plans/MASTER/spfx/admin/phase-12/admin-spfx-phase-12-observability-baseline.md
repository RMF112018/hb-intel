# Admin SPFx IT Control Center — Phase 12 Observability Baseline

**Created:** 2026-04-04
**Prompt:** P12-02 — Phase 12 Observability Baseline and Persistence Model
**Prerequisite:** P12-01 gap map (`admin-spfx-phase-12-observability-gap-map.md`)

---

## 1. Purpose

This document defines the canonical operating model for admin observability in Phase 12. All subsequent implementation prompts must treat this baseline as the governing contract for where observability responsibilities live, what data categories exist, and what boundary rules apply.

---

## 2. Layer responsibilities

### 2.1 Operator console — SPFx (`apps/admin`)

The SPFx app is the **read and interact** surface. It must never own durable state, privileged queries, or observability execution logic.

| Responsibility | Example |
|---------------|---------|
| Render observability data fetched from backend APIs | Alert list, probe dashboard, error log, correlated timelines |
| Accept operator actions and relay them to backend | Acknowledge, resolve, escalate, refresh, filter |
| Poll or subscribe for data freshness | Alert polling (30s), probe polling (15min) |
| Present coaching, empty states, and runbook links | Deferred surfaces, contextual guidance |
| Gate visibility by complexity tier and permission | `HbcComplexityGate`, `PermissionGate` |

**Must not:**
- Persist observability data durably (no IndexedDB, no SharePoint writes from the browser).
- Classify failures or evaluate alert rules — these are backend concerns.
- Infer observability state from UI-side heuristics when backend data is available.

### 2.2 Reusable admin-intelligence package — `@hbc/features-admin`

The features-admin package provides **composable hooks, components, and client-side orchestration** for admin observability. It is the reusable layer between the SPFx app and the backend.

| Responsibility | Example |
|---------------|---------|
| React hooks that call backend observability APIs | `useAdminAlerts`, `useInfrastructureProbes`, future `useObservabilityTimeline` |
| Client-side polling orchestration | `AlertPollingService`, `ProbeScheduler` (execution trigger, not evaluation) |
| Dashboard and badge components | `AdminAlertDashboard`, `ImplementationTruthDashboard`, `AdminAlertBadge` |
| Monitor registry (client-side execution of lightweight checks) | `MonitorRegistry` with injected data providers |
| Notification routing logic (severity → channel mapping) | `notificationRouter` |
| Integration adapters (ports-and-adapters pattern) | `TeamsWebhookDispatchAdapter`, reference adapters |

**Phase 12 transition:** In-memory stores (`AdminAlertsApi`, `InfrastructureProbeApi`) must be replaced with thin API clients that read/write through backend observability APIs. The in-memory implementations become test-only fixtures.

**Must not:**
- Own durable persistence — that belongs to the backend.
- Execute privileged queries against Azure resources directly.
- Bypass the backend for observability writes.

### 2.3 Shared domain models — `packages/models`

The models package provides **shared type contracts** used by both the frontend packages and the backend.

| Responsibility | Example |
|---------------|---------|
| Observability event types and enums | Alert severity, probe health status, audit event type |
| Observability record shapes | Alert record, probe snapshot, observability incident, error event |
| Correlation key contracts | Run ID, correlation ID, domain, action key |
| Operator action contracts | Acknowledge, resolve, escalate payloads |

**Phase 12 additions expected:**
- Observability alert persistence contract (extending current `IAdminAlert`).
- Observability probe snapshot persistence contract (extending current `IProbeSnapshot`).
- Observability incident contract (new — for correlated multi-event incidents).
- Observability error event contract (new — for the error log surface).
- Operator action audit contract (extending current `IAdminAudit` event types).

### 2.4 Backend / control plane — `backend/functions`

The backend is the **single durable owner** of all observability state. It ingests, stores, queries, and governs access to observability data.

| Responsibility | Example |
|---------------|---------|
| Durable persistence for alerts, probe snapshots, incidents, errors | Azure Table Storage adapters (extending Phase 4 pattern) |
| Ingestion APIs for observability events | Accept alert evaluations, probe results, error events from authorized callers |
| Query APIs for SPFx consumption | List alerts, get probe history, query error log, build correlated timelines |
| Operator action APIs | Acknowledge, resolve, escalate — with audit trail |
| Alert evaluation and probe execution (where backend-owned) | Evaluate alert rules on ingested data, run server-side probes |
| Cross-domain correlation | Link observability events to run IDs, domains, and action keys |
| Telemetry emission to Application Insights | Structured custom events for operational monitoring |

**Must not:**
- Expose raw Table Storage entities to the frontend — always project through typed API contracts.
- Allow unauthenticated or unpermissioned observability writes.

---

## 3. Observability data categories

### 3.1 Alerts

**Definition:** Discrete operator-facing notifications that something requires attention.

| Property | Value |
|----------|-------|
| Current state | In-memory `Map` in `AdminAlertsApi`; 2 monitors wired, 4 stubs |
| Phase 12 target | Durable backend persistence; all feasible monitors wired |
| Owner | Backend (persistence + evaluation); features-admin (display + polling) |
| Lifecycle | Created → Active → Acknowledged → Resolved |
| Correlation | `affectedEntityId`, `affectedEntityType`, `category` |
| Retention | Operator-facing; retained for audit and trend analysis |

### 3.2 Probe snapshots

**Definition:** Point-in-time infrastructure health assessments.

| Property | Value |
|----------|-------|
| Current state | In-memory `Map` in `InfrastructureProbeApi`; 2 probes live, 3 stubs |
| Phase 12 target | Durable backend persistence; all feasible probes wired |
| Owner | Backend (persistence + optional server-side execution); features-admin (client-triggered execution + display) |
| Lifecycle | Captured → Stored → Queryable |
| Correlation | `probeKey`, `snapshotId`, `capturedAt` |
| Retention | Time-series; retained for health trend analysis |

### 3.3 Incidents

**Definition:** Correlated groups of related observability events that represent a single operational situation.

| Property | Value |
|----------|-------|
| Current state | Not yet modeled — alerts and audit events exist independently |
| Phase 12 target | Introduce incident model linking alerts, audit events, and error events by correlation keys |
| Owner | Backend (correlation + persistence); features-admin (display) |
| Lifecycle | Opened → Investigating → Resolved → Closed |
| Correlation | `incidentId`, linked `alertIds`, linked `runIds`, `domain` |
| Retention | Operator-facing; retained for post-incident review |

### 3.4 Error events

**Definition:** Discrete error records surfaced on the error log page.

| Property | Value |
|----------|-------|
| Current state | `ErrorLogPage` is a deferred stub; no error event persistence |
| Phase 12 target | Backend error event ingestion and query; real error log surface |
| Owner | Backend (persistence + ingestion); features-admin (display hook); apps/admin (page) |
| Lifecycle | Occurred → Recorded → Queryable → (optionally linked to incident) |
| Correlation | `errorId`, `domain`, `runId` (when applicable), `actionKey` |
| Retention | Operator-facing; retained for diagnosis and audit |

### 3.5 Correlated run timeline items

**Definition:** Ordered sequence of events associated with a specific admin run, providing a unified view of what happened.

| Property | Value |
|----------|-------|
| Current state | `AdminAuditStore` has 16 event types; `ProvisioningAuditBridge` emits 11 provisioning event types; only provisioning domain wired |
| Phase 12 target | Extend audit event emission to additional admin domains; expose timeline query API |
| Owner | Backend (persistence + query); features-admin (display) |
| Lifecycle | Emitted → Stored → Queryable as timeline |
| Correlation | `runId`, `auditId`, `domain`, `eventType`, `timestamp` |
| Retention | Append-only; retained for operational and compliance audit |

### 3.6 Operator actions

**Definition:** Records of operator interactions with observability state — acknowledgments, resolutions, escalations.

| Property | Value |
|----------|-------|
| Current state | `acknowledge()` exists on `AdminAlertsApi` (in-memory); provisioning retry/escalate/archive are real backend actions |
| Phase 12 target | All operator actions against observability state produce durable audit records |
| Owner | Backend (persistence + authorization); features-admin (action hooks) |
| Lifecycle | Requested → Authorized → Executed → Audited |
| Correlation | `actionId`, `targetEntityId`, `actorUpn`, `domain` |
| Retention | Append-only audit records; same store as run timeline |

---

## 4. Raw telemetry vs durable operator-facing state

| Category | Raw telemetry | Durable operator-facing state |
|----------|--------------|-------------------------------|
| **Definition** | Unprocessed events emitted by code instrumentation | Normalized, queryable records designed for operator consumption |
| **Examples** | Application Insights custom events, `console.warn` output, HTTP request traces | Alert records, probe snapshots, audit events, error log entries |
| **Owner** | Application Insights / Azure Monitor | Backend Azure Table Storage |
| **Retention** | Platform-managed (90-day default in App Insights) | Application-managed per retention policy |
| **Query surface** | KQL in Azure portal or Log Analytics | Backend query APIs consumed by SPFx |
| **Access** | Azure RBAC (platform team / DevOps) | Application-level permission gates (operator roles) |

**Boundary rule:** Raw telemetry is valuable for debugging and platform monitoring but is not the operator's primary observability surface. Phase 12 must ensure that operators see **durable, normalized, application-level records** through SPFx — not raw telemetry views.

The provisioning saga already emits structured telemetry to Application Insights (`ProvisioningSagaStarted`, `ProvisioningStepCompleted`, etc.). These remain valuable as raw telemetry. Phase 12 adds the **operator-facing projection** — the same events, normalized into durable audit records queryable through the SPFx console.

---

## 5. What must not live only in browser memory

| Data | Current state | Required Phase 12 change |
|------|--------------|-------------------------|
| Active and historical alerts | In-memory `Map` in `AdminAlertsApi` | Backend-persisted, queried via API |
| Probe snapshots and history | In-memory `Map` in `InfrastructureProbeApi` | Backend-persisted, queried via API |
| Alert acknowledgment / resolution state | In-memory property on alert record | Backend-persisted with operator audit trail |
| Error events for the error log | Not stored at all | Backend-persisted, queried via API |
| Notification dispatch status | Fire-and-forget, no record | Backend-recorded delivery status |

**Anything that an operator would expect to survive a page reload must be backend-owned.**

---

## 6. Relationship to existing admin-control surfaces

### Provisioning domain (fully wired)
- Provisioning saga already emits structured telemetry and terminal-state evidence.
- `ProvisioningAuditBridge` already writes to the generalized audit spine.
- `ProvisioningOversightPage` already displays runs, failures, retry/escalate/archive actions.
- Phase 12 extends this with durable alert persistence and correlated timeline queries.

### SharePoint control domain (partially wired)
- `SharePointControlPage` (19.0 KB) has real operator actions.
- No observability event emission to the audit spine yet.
- Phase 12 should add audit bridge for SharePoint control actions.

### Entra / identity control domain (partially wired)
- `EntraLanePage` (49.1 KB) has real operator actions.
- No observability event emission to the audit spine yet.
- Phase 12 should add audit bridge for Entra control actions.

### Standards configuration domain (partially wired)
- `StandardsConfigPage` (18.4 KB) has real operator actions.
- Config modification audit events are defined in `AdminAuditEventType` but may not yet be emitted.
- Phase 12 should verify and complete event emission.

### Setup / install domain (fully wired)
- Install runs produce full run/audit/evidence records through the Phase 4 baseline.
- `InstallRunDetailPage` already shows step-level diagnostics.
- Phase 12 preserves this; no rebuild needed.

### White-glove deployment domain (fully wired within its scope)
- White-glove pages (6 pages) have real operator workflows.
- Run/audit integration follows the Phase 4 pattern.
- Phase 12 preserves this; extends timeline query to include white-glove events.

### Health / operational dashboard (partially wired)
- `OperationalDashboardPage` shows queue health, bottleneck detection, alert dashboard, probe dashboard.
- Alert and probe data currently in-memory.
- Phase 12 transitions these to backend-queried data.

---

## 7. Baseline rules for Phase 12 implementation

1. **Backend owns all durable observability state.** No exceptions.
2. **SPFx reads and interacts; it does not persist.** In-memory stores in `features-admin` become API clients.
3. **`packages/models` carries all shared type contracts.** Both frontend and backend import from models.
4. **Extend, do not replace, healthy Phase 4 foundations.** `AdminRunStore`, `AdminAuditStore`, `AdminEvidenceStore`, and the `ProvisioningAuditBridge` pattern are the templates.
5. **New observability stores follow the Phase 4 adapter pattern.** Azure Table Storage with partition/row key design, typed adapters, serialization round-trip tests.
6. **Alert evaluation may run client-side or server-side**, but alert state must be written to the backend.
7. **Probe execution may be client-triggered**, but probe results must be written to the backend.
8. **All operator actions against observability state must produce audit records.**
9. **Cross-domain correlation uses `runId`, `domain`, and `actionKey`** as the primary correlation keys, consistent with the existing audit spine.
10. **ErrorLogPage becomes a real surface** querying backend error/audit event APIs — not a browser-side log viewer.

---

## Validation

- [x] Baseline does not contradict P12-01 gap map findings
- [x] Layer responsibilities match the governing end-state plan (SPFx = console, backend = control plane)
- [x] No responsibility implies browser-owned durability
- [x] Data categories cover all P12-01 identified limitations (L1–L11)
- [x] Relationship to existing surfaces is grounded in verified repo state

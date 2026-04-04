# Admin SPFx IT Control Center — Phase 12 Observability Gap Map

**Created:** 2026-04-04
**Last updated:** 2026-04-04
**Prompt:** P13-01 — Phase 12 Repo-Truth Observability Audit and Gap Map (re-audit)
**Scope:** Audit only — no implementation changes

---

## 1. Purpose

This document records the verified observability state of the Admin SPFx IT Control Center after Phase 12 execution through P12-09. It distinguishes what already exists, what is partial, what is missing, and what should be explicitly preserved. It supersedes the original gap map written at Phase 12 entry and serves as the grounded baseline for Phase 12 exit reconciliation and any remaining Phase 12 closures.

---

## 2. Authority set actually used

| Source | Purpose |
|--------|---------|
| `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md` | Phase 12 definition and exit criteria |
| `docs/architecture/plans/MASTER/spfx/admin/phase-13/Admin-SPFx-IT-Control-Center-Phase-12-Summary-Plan.md` | Phase 12 objectives and deliverables |
| `docs/architecture/blueprint/current-state-map.md` | Present-truth repo coverage |
| `apps/admin/package.json` | App version and dependencies |
| `apps/admin/src/router/routes.ts` | Current route definitions |
| `apps/admin/src/router/lane-registry.ts` | Lane status and navigation metadata |
| `apps/admin/src/pages/ErrorLogPage.tsx` | Implemented error log surface verification |
| `apps/admin/src/pages/SystemSettingsPage.tsx` | Access control + approval authority |
| `apps/admin/src/pages/OperationalDashboardPage.tsx` | Health/alerts/probes surface |
| `apps/admin/src/pages/ProvisioningOversightPage.tsx` | Primary observability hub |
| `packages/features/admin/README.md` | Documented Phase 12 completions and remaining limitations |
| `packages/features/admin/src/` | All monitors, probes, APIs, hooks, components, integrations |
| `packages/models/src/admin-control-plane/` | Admin domain models, observability enums, and durable contracts |
| `backend/functions/src/services/service-factory.ts` | Backend adapter wiring |
| `backend/functions/src/hosts/admin-control-plane/service-factory.ts` | Admin control plane composition root with observability stores |
| `backend/functions/src/functions/adminApi/observability-routes.ts` | Backend observability API surface |
| `backend/functions/src/functions/adminApi/observability-emitter.ts` | Fire-and-forget error emission |
| `backend/functions/src/services/admin-control-plane/observability-error-store.ts` | Durable error persistence |
| `backend/functions/src/services/admin-control-plane/observability-alert-store.ts` | Durable alert persistence |
| `backend/functions/src/services/admin-control-plane/observability-probe-store.ts` | Probe snapshot persistence |
| `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts` | Saga telemetry, evidence, failure classification |
| `backend/functions/src/services/admin-control-plane/admin-run-store.ts` | Durable run persistence |
| `backend/functions/src/services/admin-control-plane/admin-audit-store.ts` | Durable audit persistence |
| Test files across `features-admin`, `backend/functions`, and `apps/admin` | Coverage verification |

---

## 3. Confirmed repo facts

### Admin app (`apps/admin`)
- **Exists** as a real SPFx app package, version `0.0.122`.
- **20+ page files** under `src/pages/`, using TanStack Router with a lane-registry navigation pattern.
- **`ProvisioningFailuresPage.tsx` no longer exists.** The route `/provisioning-failures` is a legacy redirect to `/runs`, served by `ProvisioningOversightPage.tsx`.
- **`ErrorLogPage.tsx` is fully implemented** (P12-08). Queries backend `POST /api/admin/observability/errors` via `useObservabilityErrors()` hook. Supports domain, severity, and classification filters. Renders error cards with severity badges, correlation metadata, timestamps, and optional run IDs. Smart empty states distinguish truly empty from filter-empty.
- **Lane registry** marks the Errors lane as `active` and Validation lane as `scaffold` (Phase 7 delivery).
- **Legacy redirects** in place: `/provisioning-failures` to `/runs`, `/dashboards` to `/health`, `/error-log` to `/errors`.
- **Root route** integrates alert polling (30s) and probe polling (15min) at the shell level.
- **Alert badge** appears in navigation for the Health lane via `useAdminAlerts()`.
- **All observability routes** protected by `adminBeforeLoad()` permission guard requiring `admin:access-control:view`.

### Features-admin (`@hbc/features-admin`)
- **Exists** as the reusable admin-intelligence layer.
- **Ports-and-adapters architecture** with dependency injection for monitors and probes.
- **README updated** with Phase 12 completions (P12-04 through P12-09).
- **Documented remaining limitations:** 3 of 6 monitors are stubs, 3 of 5 probes are deferred, email relay is console-log only, Teams webhook is fire-and-forget (no retry queue), `ApprovalAuthorityApi` remains a stub.

### Alert system
- `AdminAlertsApi`: real implementation with **backend-persisted durable state** via `ObservabilityAlerts` table (P12-04). In-memory `Map` serves as local cache.
- `useAdminAlerts` hook: real, React Query integration, 30s polling. Supports `acknowledge()` and `resolve()` actions (P12-09).
- `AdminAlertBadge`: real component with severity-weighted count and tooltip.
- `AdminAlertDashboard`: real component with severity/category/acknowledgment filtering.
- `notificationRouter`: real severity-based routing logic (immediate vs digest).

### Monitor system
- `MonitorRegistry`: real implementation with sequential execution and deduplication.
- **3 of 6 monitors wired** with injected `IProvisioningDataProvider`:
  - `provisioningFailureMonitor` — detects failed runs, escalates to critical at retry ceiling.
  - `stuckWorkflowMonitor` — detects InProgress runs stuck > 30 min, escalates at > 2 h.
  - `overdueProvisioningMonitor` — detects Submitted runs overdue > 60 min, escalates at > 4 h (P12-06).
- **3 of 6 monitors are empty stubs** returning `[]`:
  - `permissionAnomalyMonitor` — no permission audit data source.
  - `upcomingExpirationMonitor` — no expiration-tracked entities modeled.
  - `staleRecordMonitor` — no record-freshness metadata modeled.

### Probe system
- `ProbeScheduler`: real implementation with exponential backoff retry (3 attempts).
- `InfrastructureProbeApi`: real implementation with **backend-persisted durable state** via `ObservabilityProbeSnapshots` table (P12-05). In-memory `Map` serves as local cache.
- `useInfrastructureProbes` hook: real, React Query, monotonic staleness guard.
- `ImplementationTruthDashboard`: real component showing 5 probe sections with staleness detection.
- **2 of 5 probes have live connections:**
  - `azureFunctionsProbe` — calls `/api/health` with bearer token.
  - `sharePointProbe` — uses project-setup-requests endpoint as connectivity check.
- **3 of 5 probes are deferred** returning `unknown` status (P12-06 corrected from misleading `healthy`):
  - `searchProbe` (azure-search) — no Azure Search adoption.
  - `notificationProbe` (notification-system) — no health endpoint.
  - `moduleRecordHealthProbe` (module-record-health) — no per-module integrity queries.

### Notification dispatch
- `TeamsWebhookDispatchAdapter`: real, with **delivery status tracking**, acknowledged-alert suppression, and 5-minute duplicate suppression cooldown (P12-09).
- Email relay: **console-logged only** — no SMTP integration.
- Teams webhook delivery is fire-and-forget (no retry queue).

### Approval authority system
- `ApprovalAuthorityApi`: **stub** — `getRules()` returns `[]`, `upsertRule()` generates synthetic ID but does not persist, `deleteRule()` is no-op.
- `useApprovalAuthority` hook: real hook structure over stub API.
- `SystemSettingsPage`: real UI with Wave 0 limitation banner ("not persisted").

### Backend (`backend/functions`)
- **Admin control plane composition root** (`hosts/admin-control-plane/service-factory.ts`): dedicated boundary with observability stores (`observabilityAlertStore`, `observabilityProbeStore`, `observabilityErrorStore`) wired alongside run, audit, and preflight services.
- **Observability Error Store** (`observability-error-store.ts`): durable Azure Table Storage (`ObservabilityErrors`), append-only, domain-partitioned, supports ingestion and filtered query by domain/source/classification/severity/runId/from/to (P12-01).
- **Observability Alert Store** (`observability-alert-store.ts`): durable Azure Table Storage (`ObservabilityAlerts`), category-partitioned, deduplication by `dedupeKey`, severity transition tracking (`previousSeverity`), acknowledge/resolve actions, paginated query (P12-02).
- **Observability Probe Store** (`observability-probe-store.ts`): probe snapshot persistence (P12-03). Interface defined; full query operations partially implemented.
- **Observability API routes** (`observability-routes.ts`): `GET/POST` for alerts (list, get, acknowledge, resolve), probes (list), errors (list), dashboard summary, and timeline by runId (P12-05).
- **Observability emitter** (`observability-emitter.ts`): fire-and-forget error record ingestion from route error handlers with classification heuristics (Permissions → High, Structural/Transient/AdminClass/Unclassified → Medium).
- **Observability dashboard service**: interface defined for combined alerts + probes + errors summary; implementation partially complete.
- **Observability timeline service**: interface defined for run correlation and log reconstruction; implementation partially complete.
- **Provisioning saga** (`saga-orchestrator.ts`): real orchestration with durable status via Table Storage, structured telemetry events, retry correlation via `parentCorrelationId`, 5-class failure classification, evidence payload assembly at terminal states.
- **Admin Run Store** (`admin-run-store.ts`): real Azure Table Storage (`AdminRuns`), partition by domain, row by runId.
- **Admin Audit Store** (`admin-audit-store.ts`): real Azure Table Storage (`AdminAuditEvents`), append-only Insert, 16 audit event types.
- **Admin Evidence Store**: real Azure Table Storage, durable evidence persistence.
- **Provisioning Audit Bridge** (`provisioning-audit-bridge.ts`): real fire-and-forget bridge mapping 11 provisioning events to the generalized audit spine.
- **Logging:** structured JSON via `ILogger` with Application Insights queryability.
- **Telemetry:** handler lifecycle wrapper (`withTelemetry`) emitting `handler.invoke`, `handler.success`, `handler.error`.
- **Retry:** exponential backoff with Retry-After header honor, configurable transient detection.
- **Idempotency:** 24h TTL, fail-open semantics, 32KB response cap.

### Models (`packages/models`)
- **Observability contracts** in `admin-control-plane/`:
  - `IObservabilityAlertRecord`, `IObservabilityAlertIngestionPayload`, `IObservabilityAlertQuery`, `IObservabilityAlertSummary`
  - `IObservabilityProbeResultRecord`, `IObservabilityProbeSnapshotRecord`, `IObservabilityProbeSnapshotQuery`, `IObservabilityProbeSubmissionPayload`, `IObservabilityProbeHealthSummary`
  - `IObservabilityErrorRecord`, `IObservabilityErrorIngestionPayload`, `IObservabilityErrorQuery`
  - `IObservabilityIncidentRecord`, `IObservabilityCorrelation`, `IObservabilityOperatorActionRecord`, `IObservabilityTimelineItem`, `IObservabilityPagedResponse<T>`, `IObservabilityDashboardSummary`
- **Observability enums** (`ObservabilityEnums.ts`): severity, alert status, alert category, affected entity type, probe kind, probe health status, incident status, error classification, error source, operator action type, timeline item kind.
- **Admin domain models**: `AdminEnums.ts`, `IAdminRun.ts`, `IAdminAudit.ts`, `IProvisioningEvidence.ts`, `ProvisioningEnums.ts`.

### Test coverage
- `features-admin`: AdminAlertsApi (15 specs), provisioningFailureMonitor (12 specs), probeScheduler (9 specs), InfrastructureProbeApi (7 specs), stuckWorkflowMonitor, monitors integration, helpers.
- `backend/functions`: provisioning-audit-bridge (11 specs), durable-stores round-trip (20+ specs), saga-orchestrator, classify-failure, build-evidence-payload, admin-control-plane host boundary guards.

---

## 4. Current observability assets already present

### Fully operational

| Asset | Location | Notes |
|-------|----------|-------|
| Provisioning Oversight page | `apps/admin` — `/runs` | Retry/archive/escalate/force-state, failure classification, step-level diagnostics, tab views (Active/Failures/Completed/All) |
| Operational Dashboard page | `apps/admin` — `/health` | Queue health, state distribution, bottleneck detection, runbook links |
| Error Log page | `apps/admin` — `/errors` | Backend-integrated, domain/severity/classification filters, smart empty states, error cards with correlation metadata (P12-08) |
| Alert polling loop | `apps/admin` root route | 30s cycle via `useAlertPolling()` |
| Probe polling loop | `apps/admin` root route | 15min cycle via `useProbePolling()` |
| Alert dashboard | `@hbc/features-admin` | Filtering, grouping, acknowledgment, resolution (P12-09) |
| Alert badge | `@hbc/features-admin` | Severity-weighted nav badge |
| Probe dashboard | `@hbc/features-admin` | Per-probe status, staleness detection, manual trigger |
| Monitor registry | `@hbc/features-admin` | Sequential execution, deduplication |
| Probe scheduler | `@hbc/features-admin` | Retry with exponential backoff |
| Notification router | `@hbc/features-admin` | Severity-based immediate/digest routing |
| 3 wired monitors | `@hbc/features-admin` | provisioning-failure, stuck-workflow, overdue-provisioning (P12-06) |
| 2 wired probes | `@hbc/features-admin` | azure-functions, sharepoint |
| Durable admin run store | `backend/functions` | Azure Table Storage, partition by domain |
| Durable admin audit store | `backend/functions` | Azure Table Storage, append-only, 16 event types |
| Durable admin evidence store | `backend/functions` | Azure Table Storage |
| Durable observability error store | `backend/functions` | Azure Table Storage, append-only, domain-partitioned (P12-01) |
| Durable observability alert store | `backend/functions` | Azure Table Storage, deduplicated, severity tracking (P12-02) |
| Observability API routes | `backend/functions` | Alerts, probes, errors, dashboard, timeline (P12-05) |
| Observability error emitter | `backend/functions` | Fire-and-forget error ingestion from route handlers |
| Provisioning audit bridge | `backend/functions` | Fire-and-forget saga-to-spine bridge, 11 event types |
| Provisioning saga telemetry | `backend/functions` | Structured events throughout lifecycle |
| Failure classification | `backend/functions` | 5-class taxonomy |
| Evidence payload assembly | `backend/functions` | Per-step evidence at terminal states |
| Observability models and enums | `packages/models` | Full durable contract set |
| Safety workflow (Phase 11) | `@hbc/features-admin` | Orchestrator, preview, confirmation, post-run validation, recovery |
| Teams webhook dispatch | `@hbc/features-admin` | Delivery tracking, acknowledged-alert suppression, 5-min cooldown (P12-09) |
| Lane-registry navigation | `apps/admin` | Lanes with status metadata; Errors lane now `active` |
| Complexity-gated UI | `apps/admin` | Essential/standard/expert tier gates |
| Permission-gated operations | `apps/admin` | PermissionGate on sensitive actions |

### Partially operational

| Asset | Location | Status |
|-------|----------|--------|
| Observability probe store | `backend/functions` | Interface defined; full query operations partially implemented |
| Observability dashboard service | `backend/functions` | Interface defined; combined summary assembly pending |
| Observability timeline service | `backend/functions` | Interface defined; run correlation/log reconstruction pending |
| 3 deferred monitors | `@hbc/features-admin` | Registered but return `[]` (no domain data providers) |
| 3 deferred probes | `@hbc/features-admin` | Registered but return `unknown` (no live connections) |
| Email relay | `@hbc/features-admin` | Console-logged only |
| Teams webhook retry | `@hbc/features-admin` | Fire-and-forget; no retry queue |

---

## 5. Current observability limitations

| # | Limitation | Impact | Current location |
|---|-----------|--------|-----------------|
| L1 | 3 of 6 monitors return empty arrays | No detection for permission anomalies, upcoming expirations, or stale records | `@hbc/features-admin/src/monitors/` |
| L2 | 3 of 5 probes return `unknown` | No real health checks for search, notifications, or module-record integrity | `@hbc/features-admin/src/probes/` |
| L3 | Observability dashboard service partially implemented | Combined alerts + probes + errors summary not yet assembled into a single endpoint response | `backend/functions` |
| L4 | Observability timeline service partially implemented | Run-level correlated timeline not yet fully assembled | `backend/functions` |
| L5 | Observability probe store query operations partial | Full paginated query and health summary aggregation pending | `backend/functions` |
| L6 | Email relay is console-log only | No real email notification delivery | `TeamsWebhookDispatchAdapter` |
| L7 | Teams webhook has no retry queue | Failed deliveries are not retried | `TeamsWebhookDispatchAdapter` |
| L8 | Cross-domain observability event emission limited to provisioning | SharePoint control, Entra control, standards config, and other admin domains do not yet emit observability events to the audit spine | Backend audit bridge |
| L9 | Approval authority not persisted | Rules lost on reload (SF17-T05 scope, not Phase 12) | `ApprovalAuthorityApi` |

---

## 6. Phase 12 required closures

### Closures satisfied

| # | Closure | Limitation addressed | Evidence |
|---|---------|---------------------|----------|
| C1 | Replace in-memory alert store with durable backend persistence | (original L1) | `ObservabilityAlerts` table, `observability-alert-store.ts` (P12-04) |
| C2 | Replace in-memory probe snapshot store with durable backend persistence | (original L2) | `ObservabilityProbeSnapshots` table, `observability-probe-store.ts` (P12-05) |
| C3 | Implement real `ErrorLogPage` with queryable error/audit data | (original L3) | `ErrorLogPage.tsx` queries `/api/admin/observability/errors` with domain/severity/classification filters (P12-08) |
| C4 | Build backend ingestion APIs for alert and probe observability data | (original L6) | `observability-routes.ts` with ingestion endpoints (P12-05) |
| C5 | Build backend query APIs for alert history, probe history, and error/audit events | (original L7) | `observability-routes.ts` with GET endpoints for alerts, probes, errors, dashboard, timeline (P12-05) |
| C9 | Update `ErrorLogPage` route from SCAFFOLD to ACTIVE in lane registry | (original L11) | Lane registry marks Errors as `active` |
| C10 | Harden notification dispatch with delivery tracking | (original L8) | Teams webhook delivery tracking, suppression, and cooldown (P12-09) |

### Closures partially satisfied

| # | Closure | Limitation | Status |
|---|---------|-----------|--------|
| C6 | Implement remaining monitors where data providers exist | L1 | 3 of 6 wired (was 2 of 6). `overdueProvisioningMonitor` added (P12-06). Remaining 3 lack domain data providers. |
| C7 | Implement remaining probes where live connections exist | L2 | 2 of 5 live. Deferred probes corrected to return `unknown` (P12-06). Remaining 3 lack live endpoints. |
| C8 | Add observability event emission for admin domains beyond provisioning | L8 | Only provisioning saga emits structured audit events. Other domains not yet instrumented. |

### Closures not yet started

| # | Closure | Notes |
|---|---------|-------|
| C11 | Update documentation to remove placeholder/deferred claims where real functionality exists | Documentation update pass not yet completed |
| C12 | Produce Phase 12 exit reconciliation with residual risks | Exit report not yet written |

### Closures explicitly scoped OUT of Phase 12
- Approval authority persistence (L9) — SF17-T05 scope, not observability.
- Validation lane implementation — Phase 7 scope.
- Frontend Application Insights SDK — backend-only telemetry is current doctrine.
- Broad admin information architecture redesign beyond what observability requires.

---

## 7. Non-gaps / do-not-rebuild items

These items are healthy, production-grade, and must be preserved rather than rebuilt.

| Item | Reason to preserve |
|------|-------------------|
| `ProvisioningOversightPage` | Fully real, retry/archive/escalate/force-state, failure classification, step diagnostics, tab views |
| `OperationalDashboardPage` | Real queue health, bottleneck detection, alert dashboard integration |
| `ErrorLogPage` | Fully implemented with backend integration, filters, smart empty states (P12-08) |
| Phase 4 durable stores (`AdminRunStore`, `AdminAuditStore`, `AdminEvidenceStore`) | Production-grade Table Storage with serialization tests |
| Phase 12 observability stores (`ObservabilityErrorStore`, `ObservabilityAlertStore`) | Durable Table Storage with deduplication and query support |
| Observability API route surface | Alert CRUD, probes, errors, dashboard, timeline endpoints |
| Observability error emitter | Fire-and-forget error ingestion from route handlers |
| Provisioning saga telemetry and evidence | Structured events, 5-class failure classification, evidence payloads |
| `ProvisioningAuditBridge` | Fire-and-forget bridge with 11 event mappings |
| Admin domain models in `packages/models` | Comprehensive enums, run envelope, audit records, observability contracts |
| Phase 11 safety workflow components | Orchestrator, preview, confirmation, validation, recovery |
| Monitor registry architecture | Sequential execution, deduplication, provider injection |
| Probe scheduler architecture | Retry with exponential backoff, snapshot assembly |
| Teams webhook dispatch with delivery tracking | Delivery status, alert suppression, cooldown (P12-09) |
| Ports-and-adapters pattern in `@hbc/features-admin` | Clean dependency inversion for testability |
| Lane-registry navigation pattern | Single source of truth for routes, nav, and landing cards |
| Alert polling and probe polling integration | Root-route-level initialization, cleanup on unmount |
| Complexity and permission gating patterns | Consistent tier and permission enforcement |
| Existing test suites | AdminAlertsApi, monitors, probes, durable stores, bridge, saga |

---

## 8. Dependencies on prior phases — satisfied vs still partial

### Fully satisfied

| Dependency | Phase | Evidence |
|-----------|-------|---------|
| Admin app exists as real SPFx package | Phase 2/3 | `apps/admin/package.json` v0.0.122, 20+ pages |
| Durable run/audit/evidence stores in Table Storage | Phase 4 | `DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore` with round-trip tests |
| Provisioning saga with structured telemetry | Phase 4 | `saga-orchestrator.ts`, `classify-failure.ts`, `build-evidence-payload.ts` |
| Provisioning audit bridge to generalized spine | Phase 4 | `provisioning-audit-bridge.ts` with 11 event mappings |
| Admin-intelligence package with monitors, probes, APIs | Wave 0 G6 | `@hbc/features-admin` with full public API surface |
| Alert and probe polling wired into app shell | Wave 0 G6 | Root route integrates `useAlertPolling()` and `useProbePolling()` |
| Operator-facing dashboards for runs and health | Wave 0 G6 | `ProvisioningOversightPage`, `OperationalDashboardPage` |
| Safety workflow model with evidence | Phase 11 | `SafetyWorkflowOrchestrator`, backend enforcement, durable evidence |
| Admin control-plane domain models | Phase 4 | `packages/models/src/admin-control-plane/` |
| Backend persistence adapters for alerts, probes, and errors | Phase 12 | `ObservabilityAlertStore`, `ObservabilityProbeStore`, `ObservabilityErrorStore` (P12-04) |
| Backend observability query/ingestion APIs | Phase 12 | `observability-routes.ts` (P12-05) |
| Real error log surface | Phase 12 | `ErrorLogPage.tsx` (P12-08) |

### Still partial

| Dependency | Phase | Status | Impact on remaining Phase 12 work |
|-----------|-------|--------|-----------------------------------|
| Cross-domain observability event emission | Phase 12 (P12-07) | Only provisioning saga emits audit events | Remaining admin domains need instrumentation for C8 |
| Monitor data providers for non-provisioning domains | Phase 12 (P12-06) | 3 monitors lack domain-specific data providers | Cannot fire without domain modeling that may exceed Phase 12 scope |
| Live connections for 3 deferred probes | Phase 12 (P12-06) | search, notification, module-record-health probes return `unknown` | Cannot connect without backend health endpoints that may not exist yet |
| Observability dashboard summary assembly | Phase 12 (P12-05) | Interface defined, implementation partially complete | Full combined summary not yet returned from `/api/admin/observability/dashboard` |
| Observability timeline assembly | Phase 12 (P12-05) | Interface defined, implementation partially complete | Full correlated timeline not yet returned from `/api/admin/observability/timeline/{runId}` |

---

## 9. Unresolved implementation issues with recommended direction

### I1 — Which deferred monitors can reasonably be completed in remaining Phase 12 work

**Issue:** 3 monitors are stubs. Each requires a domain-specific data provider:
- `permissionAnomalyMonitor` — requires permission audit data source (not yet modeled).
- `upcomingExpirationMonitor` — requires expiration-tracked entities (not yet modeled).
- `staleRecordMonitor` — requires record-freshness metadata (not yet modeled).

**Recommended direction:** These 3 monitors require domain modeling that exceeds Phase 12 observability scope. Document them as known deferrals in the Phase 12 exit report with clear data-provider prerequisites for each. Do not attempt to build the domain models just to satisfy monitor stubs.

### I2 — Which deferred probes can reasonably be completed in remaining Phase 12 work

**Issue:** 3 probes return `unknown`:
- `searchProbe` (azure-search) — requires Azure Search service endpoint.
- `notificationProbe` (notification-system) — requires notification system health endpoint.
- `moduleRecordHealthProbe` — requires module-record integrity query.

**Recommended direction:** Implement `searchProbe` and `notificationProbe` if the corresponding backend health endpoints exist or can be added with minimal effort. Defer `moduleRecordHealthProbe` if the integrity query requires substantial new domain modeling. The P12-06 correction to return `unknown` instead of `healthy` already eliminates the misleading-status risk.

### I3 — Dashboard and timeline service completion

**Issue:** The observability dashboard service and timeline service have interfaces defined but implementations are partially complete. The `/api/admin/observability/dashboard` and `/api/admin/observability/timeline/{runId}` endpoints may not yet return fully assembled responses.

**Recommended direction:** Complete the dashboard summary assembly (combine alert summary, probe health summary, and recent error counts) and timeline assembly (correlate audit events, alerts, errors, and operator actions by runId) during the remaining Phase 12 prompts (P12-10/P12-11). These are required for the exit criteria claim that operators have trustworthy visibility.

### I4 — Cross-domain correlation breadth

**Issue:** Only the provisioning saga emits structured audit events to the generalized spine. Other admin domains (SharePoint control, Entra control, standards config, white-glove deployment) do not yet emit observability events.

**Recommended direction:** Instrument the highest-traffic admin domains first (SharePoint control and Entra control already have real page implementations) using the `ProvisioningAuditBridge` pattern as a template. Defer lower-traffic domains to Phase 13 if instrumentation would require substantial new backend plumbing. This is C8 scope.

### I5 — Notification retry and email relay

**Issue:** Teams webhook delivery is fire-and-forget (no retry queue). Email relay is console-log only.

**Recommended direction:** Accept current state as Phase 12 sufficient. Delivery tracking (P12-09) provides observability into failures. Full retry queue and SMTP integration are Phase 13+ scope unless the user explicitly redirects.

---

## 10. Recommended internal breakdown for remaining Phase 12 execution

| Step | Description | Status | Closures addressed | Primary code areas |
|------|------------|--------|-------------------|-------------------|
| P12-01 | Repo-truth observability audit and gap map | **Complete** (this document) | — | docs only |
| P12-02 | Lock Phase 12 observability baseline and persistence model | **Complete** | C1, C2 prerequisites | docs, models |
| P12-03 | Shared observability contracts and models | **Complete** | C1, C2, C4 prerequisites | `packages/models` |
| P12-04 | Durable persistence adapters and storage plumbing | **Complete** | C1, C2 | `backend/functions` |
| P12-05 | Backend ingestion/query/action APIs | **Complete** (dashboard/timeline partial) | C4, C5 | `backend/functions` |
| P12-06 | Probe execution and alert evaluation hardening | **Complete** | C6, C7 (partial) | `@hbc/features-admin`, `backend/functions` |
| P12-07 | Cross-domain instrumentation and correlation | **Not started** | C8 | `backend/functions`, `@hbc/features-admin` |
| P12-08 | SPFx unified observability surfaces and routing | **Complete** | C3, C9 | `apps/admin` |
| P12-09 | Notification dispatch and operator action workflows | **Complete** | C10 | `@hbc/features-admin`, `backend/functions` |
| P12-10 | Testing, docs, runbooks, and config guidance | **Not started** | C11 | docs, tests |
| P12-11 | Phase 12 exit reconciliation and release readiness | **Not started** | C12 | docs |

### Remaining work summary

1. **P12-07 (cross-domain instrumentation):** Instrument SharePoint control and Entra control domains with audit event emission. Assess white-glove and standards-config domains.
2. **P12-05 completion:** Finish dashboard summary and timeline assembly implementations.
3. **P12-10 (testing/docs/runbooks):** Update documentation to remove stale placeholder claims. Add operator runbook notes. Add configuration guidance.
4. **P12-11 (exit reconciliation):** Produce Phase 12 exit report with residual risks, deferred items, and Phase 13 entry guidance.

---

## Validation checklist

- [x] All named file paths verified to exist (or confirmed absent where noted, e.g., `ProvisioningFailuresPage.tsx`)
- [x] Gap map does not present target-state claims as repo truth
- [x] Recommended breakdown remains Phase 12 only
- [x] Closures map to governing exit criteria
- [x] Non-gaps explicitly documented to prevent unnecessary rebuilds
- [x] Unresolved issues include recommended direction, not just problem statements
- [x] Phase 12 progress accurately reflected against exploration evidence

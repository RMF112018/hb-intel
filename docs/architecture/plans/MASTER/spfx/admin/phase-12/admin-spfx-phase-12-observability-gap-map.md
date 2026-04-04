# Admin SPFx IT Control Center — Phase 12 Observability Gap Map

**Created:** 2026-04-04
**Prompt:** P12-01 — Repo-Truth Observability Audit and Gap Map
**Scope:** Audit only — no implementation changes

---

## 1. Purpose

This document records the verified observability state of the Admin SPFx IT Control Center as of the start of Phase 12. It distinguishes what already exists, what is partial, what is missing, and what should be explicitly preserved. It serves as the grounded baseline for all subsequent Phase 12 implementation prompts.

---

## 2. Authority set actually used

| Source | Purpose |
|--------|---------|
| `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md` | Phase 12 definition and exit criteria |
| `docs/architecture/plans/MASTER/spfx/admin/phase-12/Admin-SPFx-IT-Control-Center-Phase-12-Summary-Plan.md` | Phase 12 objectives and deliverables |
| `docs/architecture/blueprint/current-state-map.md` | Present-truth repo coverage |
| `apps/admin/package.json` | App version and dependencies |
| `apps/admin/src/router/routes.ts` | Current route definitions |
| `apps/admin/src/router/lane-registry.ts` | Lane status and navigation metadata |
| `apps/admin/src/router/root-route.tsx` | Alert/probe polling integration |
| `apps/admin/src/pages/ErrorLogPage.tsx` | Deferred stub verification |
| `apps/admin/src/pages/SystemSettingsPage.tsx` | Access control + approval authority |
| `apps/admin/src/pages/OperationalDashboardPage.tsx` | Health/alerts/probes surface |
| `apps/admin/src/pages/ProvisioningOversightPage.tsx` | Primary observability hub |
| `packages/features/admin/README.md` | Documented Wave 0 limitations |
| `packages/features/admin/package.json` | Package version and exports |
| `packages/features/admin/src/` | All monitors, probes, APIs, hooks, components, integrations |
| `packages/models/src/admin-control-plane/` | Admin domain models and enums |
| `backend/functions/src/services/service-factory.ts` | Backend adapter wiring |
| `backend/functions/src/functions/provisioningSaga/` | Saga telemetry, evidence, failure classification |
| `backend/functions/src/services/admin-control-plane/` | Durable run/audit/evidence stores |
| Test files across `features-admin`, `backend/functions`, and `apps/admin` | Coverage verification |

---

## 3. Confirmed repo facts

### Admin app (`apps/admin`)
- **Exists** as a real SPFx app package, version `00.000.121`.
- **20 page files** under `src/pages/`, using TanStack Router with a lane-registry navigation pattern.
- **`ProvisioningFailuresPage.tsx` no longer exists.** The route `/provisioning-failures` is a legacy redirect to `/runs`, served by `ProvisioningOversightPage.tsx`.
- **`ErrorLogPage.tsx` exists** as an intentional deferred stub. Renders `HbcSmartEmptyState` with coaching text and a redirect to Provisioning Oversight. Deferred to SF17-T05.
- **Lane registry** marks the Errors lane as `SCAFFOLD` (delivery: SF17-T05) and Validation lane as `SCAFFOLD` (delivery: Phase 7).
- **Root route** integrates `useAlertPolling()` (30s) and `useProbePolling()` (15min) at the shell level.
- **Alert badge** appears in navigation for the Health lane via `useAdminAlerts()`.

### Features-admin (`@hbc/features-admin`)
- **Exists** as the reusable admin-intelligence layer, version `0.2.1`.
- **Ports-and-adapters architecture** with dependency injection for monitors and probes.
- **Public API surface:** 21 type exports, 11 constants, 6 monitors, 5 probes, 3 API classes, 6 hooks, 6 adapters, 13 components.
- **Testing sub-path** exported at `@hbc/features-admin/testing`.

### Alert system
- `AdminAlertsApi`: real implementation, **in-memory `Map<string, IAdminAlert>`** — no durable persistence.
- `useAdminAlerts` hook: real, React Query integration, 30s polling.
- `AdminAlertBadge`: real component with severity-weighted count and tooltip.
- `AdminAlertDashboard`: real component with severity/category/acknowledgment filtering.
- `notificationRouter`: real severity-based routing logic (immediate vs digest).

### Monitor system
- `MonitorRegistry`: real implementation with sequential execution and deduplication.
- **2 of 6 monitors wired** with injected `IProvisioningDataProvider`:
  - `provisioningFailureMonitor` — detects failed runs, escalates to critical at retry ceiling.
  - `stuckWorkflowMonitor` — detects InProgress runs stuck > 30 min, escalates at > 2 h.
- **4 of 6 monitors are empty stubs** returning `[]`:
  - `permissionAnomalyMonitor`
  - `overdueProvisioningMonitor`
  - `upcomingExpirationMonitor`
  - `staleRecordMonitor`

### Probe system
- `ProbeScheduler`: real implementation with exponential backoff retry (3 attempts).
- `InfrastructureProbeApi`: real implementation, **in-memory `Map<string, IProbeSnapshot>`** — no durable persistence.
- `useInfrastructureProbes` hook: real, React Query, monotonic staleness guard.
- `ImplementationTruthDashboard`: real component showing 5 probe sections with staleness detection.
- **2 of 5 probes have live connections:**
  - `azureFunctionsProbe` — calls `/api/health` with bearer token.
  - `sharePointProbe` — uses project-setup-requests endpoint as connectivity check.
- **3 of 5 probes are stubs** returning healthy:
  - `searchProbe` (azure-search)
  - `notificationProbe` (notification-system)
  - `moduleRecordHealthProbe` (module-record-health)

### Approval authority system
- `ApprovalAuthorityApi`: **stub** — `getRules()` returns `[]`, `upsertRule()` generates synthetic ID but does not persist, `deleteRule()` is no-op.
- `useApprovalAuthority` hook: real hook structure over stub API.
- `SystemSettingsPage`: real UI with Wave 0 limitation banner ("not persisted").

### Notification dispatch
- `TeamsWebhookDispatchAdapter`: real, **best-effort fire-and-forget** — no delivery confirmation.
- Email relay: **console-logged only** — no SMTP integration.

### Backend (`backend/functions`)
- `service-factory.ts`: singleton with tiered initialization, adapter-mode resolution, telemetry at startup.
- **Provisioning saga** (`saga-orchestrator.ts`): real orchestration with durable status via Table Storage, structured telemetry events, retry correlation via `parentCorrelationId`, failure classification (5-class taxonomy), evidence payload assembly at terminal states.
- **Admin Run Store** (`admin-run-store.ts`): real Azure Table Storage implementation (`DurableAdminRunStore`), partition by domain, row by runId.
- **Admin Audit Store** (`admin-audit-store.ts`): real Azure Table Storage, append-only Insert, 16 audit event types covering run lifecycle, checkpoints, config, bindings, external events.
- **Admin Evidence Store**: real Azure Table Storage, durable evidence persistence.
- **Provisioning Audit Bridge** (`provisioning-audit-bridge.ts`): real fire-and-forget bridge mapping 11 provisioning events to the generalized audit spine.

### Models (`packages/models`)
- `AdminEnums.ts`: 10 admin domains, risk levels, execution modes.
- `IAdminRun.ts`: complete run envelope with lifecycle statuses, step results, failure summary, actor context (~260 lines).
- `IAdminAudit.ts`: evidence types, evidence references, rationale capture, config snapshot references, post-run validation.
- `IProvisioningEvidence.ts`: structured evidence schema (v1) with per-step detail, permission posture, correlation.
- `ProvisioningEnums.ts`: provisioning status and step status enums.

### Test coverage
- `features-admin`: AdminAlertsApi (15 specs), provisioningFailureMonitor (12 specs), probeScheduler (9 specs), InfrastructureProbeApi (7 specs), stuckWorkflowMonitor, monitors integration, helpers.
- `backend/functions`: provisioning-audit-bridge (11 specs), durable-stores round-trip (20+ specs), saga-orchestrator, classify-failure, build-evidence-payload.

---

## 4. Current observability assets already present

### Fully operational
| Asset | Location | Notes |
|-------|----------|-------|
| Provisioning Oversight page | `apps/admin` — `/runs` | 30.9 KB, retry/archive/escalate/force-state, failure classification, step-level diagnostics |
| Operational Dashboard page | `apps/admin` — `/health` | Queue health, state distribution, bottleneck detection, runbook links |
| Alert polling loop | `apps/admin` root route | 30s cycle via `useAlertPolling()` |
| Probe polling loop | `apps/admin` root route | 15min cycle via `useProbePolling()` |
| Alert dashboard | `@hbc/features-admin` | Filtering, grouping, acknowledgment |
| Alert badge | `@hbc/features-admin` | Severity-weighted nav badge |
| Probe dashboard | `@hbc/features-admin` | Per-probe status, staleness detection, manual trigger |
| Monitor registry | `@hbc/features-admin` | Sequential execution, deduplication |
| Probe scheduler | `@hbc/features-admin` | Retry with exponential backoff |
| Notification router | `@hbc/features-admin` | Severity-based immediate/digest routing |
| 2 wired monitors | `@hbc/features-admin` | provisioning-failure, stuck-workflow |
| 2 wired probes | `@hbc/features-admin` | azure-functions, sharepoint |
| Durable admin run store | `backend/functions` | Azure Table Storage, partition by domain |
| Durable admin audit store | `backend/functions` | Azure Table Storage, append-only, 16 event types |
| Durable admin evidence store | `backend/functions` | Azure Table Storage |
| Provisioning audit bridge | `backend/functions` | Fire-and-forget saga→spine bridge, 11 event types |
| Provisioning saga telemetry | `backend/functions` | Structured events throughout lifecycle |
| Failure classification | `backend/functions` | 5-class taxonomy (repeated, permissions, transient, structural, admin-class) |
| Evidence payload assembly | `backend/functions` | Per-step evidence at terminal states |
| Admin domain models | `packages/models` | Enums, run envelope, audit records, evidence schema |
| Safety workflow (Phase 11) | `@hbc/features-admin` | Orchestrator, preview, confirmation, post-run validation, recovery |
| Lane-registry navigation | `apps/admin` | 15 lanes with status metadata |
| Complexity-gated UI | `apps/admin` | Essential/standard/expert tier gates |
| Permission-gated operations | `apps/admin` | PermissionGate on sensitive actions |

### Partially operational
| Asset | Location | Status |
|-------|----------|--------|
| AdminAlertsApi | `@hbc/features-admin` | Real logic, **in-memory only** |
| InfrastructureProbeApi | `@hbc/features-admin` | Real logic, **in-memory only** |
| Teams webhook dispatch | `@hbc/features-admin` | Real adapter, **fire-and-forget only** |
| 4 deferred monitors | `@hbc/features-admin` | Registered but return `[]` |
| 3 deferred probes | `@hbc/features-admin` | Registered but return stub healthy |

---

## 5. Current observability limitations

| # | Limitation | Impact | Current location |
|---|-----------|--------|-----------------|
| L1 | Alert store is in-memory only | Alerts lost on page reload; no historical query across sessions | `AdminAlertsApi` |
| L2 | Probe snapshot store is in-memory only | Probe history lost on reload; no trend analysis | `InfrastructureProbeApi` |
| L3 | `ErrorLogPage` is a deferred stub | Operators have no error/audit log surface | `apps/admin/src/pages/ErrorLogPage.tsx` |
| L4 | 4 of 6 monitors return empty arrays | No detection for permission anomalies, overdue tasks, upcoming expirations, or stale records | `@hbc/features-admin/src/monitors/` |
| L5 | 3 of 5 probes return stub healthy | No real health checks for search, notifications, or module-record integrity | `@hbc/features-admin/src/probes/` |
| L6 | No backend ingestion API for alert/probe data | Frontend cannot push observability data to durable storage | Not yet implemented |
| L7 | No backend query API for alert/probe history | Frontend cannot retrieve historical observability data | Not yet implemented |
| L8 | Notification dispatch is best-effort | No delivery tracking, no retry on failure, email is console-log only | `TeamsWebhookDispatchAdapter` |
| L9 | No cross-domain correlation beyond provisioning | Only provisioning saga emits structured audit events; other admin domains (SharePoint control, Entra, etc.) lack observability event emission | Backend audit bridge |
| L10 | Approval authority not persisted | Rules lost on reload | `ApprovalAuthorityApi` |
| L11 | Errors lane marked SCAFFOLD in lane registry | Navigation metadata reflects deferred status | `lane-registry.ts` |

---

## 6. Phase 12 required closures

These are the closures required to satisfy the Phase 12 exit criteria in the governing end-state plan.

| # | Closure | Maps to limitation | Governing exit criterion |
|---|---------|-------------------|------------------------|
| C1 | Replace in-memory alert store with durable backend-owned persistence | L1 | Alert state is durable and no longer in-memory-only |
| C2 | Replace in-memory probe snapshot store with durable backend-owned persistence | L2 | Probe state is durable and no longer in-memory-only |
| C3 | Implement real `ErrorLogPage` with queryable error/audit data | L3 | `ErrorLogPage` is no longer a deferred empty shell |
| C4 | Build backend ingestion APIs for alert and probe observability data | L6 | Admin observability has a canonical backend-owned persistence and query model |
| C5 | Build backend query APIs for alert history, probe history, and error/audit events | L7 | Operators can view alerts, health, errors, and probe state through real SPFx surfaces |
| C6 | Implement remaining monitors where data providers exist or can be reasonably built | L4 | Operators have trustworthy visibility across failure states |
| C7 | Implement remaining probes where live connections can be reasonably established | L5 | Operators have trustworthy visibility across health |
| C8 | Add observability event emission for current admin domains beyond provisioning | L9 | Current admin/control-plane actions have correlated observability records |
| C9 | Update `ErrorLogPage` route from SCAFFOLD to ACTIVE in lane registry | L11 | Placeholder routing replaced with real surface |
| C10 | Harden notification dispatch with delivery tracking where feasible | L8 | Notification flows are actionable |
| C11 | Update documentation to remove placeholder/deferred claims where real functionality now exists | — | Documentation no longer claims placeholder behavior |
| C12 | Produce Phase 12 exit reconciliation with residual risks | — | Validation confirms observability layer is trustworthy |

### Closures explicitly scoped OUT of Phase 12
- Approval authority persistence (L10) — this is SF17-T05 scope, not observability scope. Phase 12 should not absorb it unless the user explicitly redirects it here.
- Validation lane implementation — Phase 7 scope.
- Frontend Application Insights SDK — backend-only telemetry is the current doctrine.
- Broad admin information architecture redesign beyond what observability requires.

---

## 7. Non-gaps / do-not-rebuild items

These items are healthy, production-grade, and must be preserved rather than rebuilt during Phase 12.

| Item | Reason to preserve |
|------|-------------------|
| `ProvisioningOversightPage` | Fully real (30.9 KB), retry/archive/escalate/force-state, failure classification, step diagnostics |
| `OperationalDashboardPage` | Real queue health, bottleneck detection, alert dashboard integration |
| Phase 4 durable stores (`AdminRunStore`, `AdminAuditStore`, `AdminEvidenceStore`) | Production-grade Table Storage with serialization tests |
| Provisioning saga telemetry and evidence | Structured events, 5-class failure classification, evidence payloads |
| `ProvisioningAuditBridge` | Fire-and-forget bridge with 11 event mappings |
| Admin domain models in `packages/models` | Comprehensive enums, run envelope, audit records |
| Phase 11 safety workflow components | Orchestrator, preview, confirmation, validation, recovery |
| Monitor registry architecture | Sequential execution, deduplication, provider injection |
| Probe scheduler architecture | Retry with exponential backoff, snapshot assembly |
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
| Admin app exists as real SPFx package | Phase 2/3 | `apps/admin/package.json` v00.000.121, 20 pages |
| Durable run/audit/evidence stores in Table Storage | Phase 4 | `DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore` with round-trip tests |
| Provisioning saga with structured telemetry | Phase 4 | `saga-orchestrator.ts`, `classify-failure.ts`, `build-evidence-payload.ts` |
| Provisioning audit bridge to generalized spine | Phase 4 | `provisioning-audit-bridge.ts` with 11 event mappings |
| Admin-intelligence package with monitors, probes, APIs | Wave 0 G6 | `@hbc/features-admin` v0.2.1 with full public API surface |
| Alert and probe polling wired into app shell | Wave 0 G6 | Root route integrates `useAlertPolling()` and `useProbePolling()` |
| Operator-facing dashboards for runs and health | Wave 0 G6 | `ProvisioningOversightPage`, `OperationalDashboardPage` |
| Safety workflow model with evidence | Phase 11 | `SafetyWorkflowOrchestrator`, backend enforcement, durable evidence via Phase 4 stores |
| Admin control-plane domain models | Phase 4 | `packages/models/src/admin-control-plane/` with enums, run, audit, evidence types |

### Still partial

| Dependency | Phase | Status | Impact on Phase 12 |
|-----------|-------|--------|-------------------|
| Backend persistence adapters for alerts and probes | Not yet started | Missing | Phase 12 must build these (C1, C2, C4, C5) |
| Cross-domain observability event emission | Phase 4 started provisioning only | Only provisioning saga emits audit events | Phase 12 must extend to other admin domains (C8) |
| Monitor data providers for non-provisioning domains | Not yet available | 4 monitors cannot fire without domain-specific providers | Phase 12 must assess which providers are feasible (C6) |
| Live connections for 3 deferred probes | Not yet available | search, notification, module-record-health probes return stubs | Phase 12 must assess which connections are feasible (C7) |

---

## 9. Unresolved implementation issues with recommended direction

### I1 — Alert/probe persistence target: Table Storage vs SharePoint lists

**Issue:** `@hbc/features-admin` README targets SharePoint lists (`HBC_AdminAlerts`, `HBC_InfrastructureProbeSnapshots`) as Wave 1 persistence. However, the backend already has proven Table Storage adapters for admin runs, audit events, and evidence.

**Recommended direction:** Use Azure Table Storage (consistent with Phase 4 durable store pattern) rather than SharePoint lists. SharePoint lists are suitable for user-facing data but not optimal for high-frequency observability writes. Update the README targets accordingly.

### I2 — Which deferred monitors can reasonably be implemented in Phase 12

**Issue:** 4 monitors are stubs. Each requires a domain-specific data provider:
- `permissionAnomalyMonitor` — requires permission audit data source
- `overdueProvisioningMonitor` — requires overdue-task query (likely derivable from existing provisioning status)
- `upcomingExpirationMonitor` — requires expiration-tracked entities (not yet modeled)
- `staleRecordMonitor` — requires record-freshness metadata (not yet modeled)

**Recommended direction:** Implement `overdueProvisioningMonitor` (data already available via provisioning status queries). Assess the others during Phase 12 execution; implement where data providers exist, defer where they require new domain modeling that exceeds Phase 12 scope.

### I3 — Which deferred probes can reasonably be implemented in Phase 12

**Issue:** 3 probes are stubs:
- `searchProbe` (azure-search) — requires Azure Search service endpoint
- `notificationProbe` (notification-system) — requires notification system health endpoint
- `moduleRecordHealthProbe` — requires module-record integrity query

**Recommended direction:** Implement `searchProbe` and `notificationProbe` if the corresponding backend health endpoints exist or can be added with minimal effort. Defer `moduleRecordHealthProbe` if the integrity query requires substantial new domain modeling.

### I4 — ErrorLogPage data source

**Issue:** `ErrorLogPage` needs a queryable data source. The backend already has an audit store with 16 event types and the provisioning audit bridge. The question is whether the error log surfaces only audit events, or a broader observability event set.

**Recommended direction:** Build the error log on top of the existing audit store and extend it with an observability-event query API that can surface alerts, audit events, and error records in a unified timeline. This avoids creating a separate error persistence layer.

### I5 — Notification dispatch hardening scope

**Issue:** Teams webhook is fire-and-forget. Email is console-log only. Full notification infrastructure (delivery tracking, retry, SMTP) is a large scope.

**Recommended direction:** Add delivery-status tracking for Teams webhook (success/failure recording) and structured logging for notification attempts. Defer full SMTP integration and retry queuing to Phase 13 or later unless the user explicitly scopes it into Phase 12.

### I6 — Cross-domain correlation breadth

**Issue:** Only the provisioning saga emits structured audit events to the generalized spine. Other admin domains (SharePoint control, Entra control, standards config, app binding) do not yet emit observability events.

**Recommended direction:** Instrument the highest-traffic admin domains first (SharePoint control actions and Entra control actions already have real page implementations) using the existing `ProvisioningAuditBridge` pattern as a template. Defer lower-traffic domains to Phase 13 if instrumentation would require substantial new backend plumbing.

---

## 10. Recommended internal breakdown for Phase 12 execution

This breakdown aligns with the Phase 12 Summary Plan's recommended sequence and the closures identified above.

| Step | Description | Closures addressed | Primary code areas |
|------|------------|-------------------|-------------------|
| P12-01 | Repo-truth observability audit and gap map (this document) | — | docs only |
| P12-02 | Lock the Phase 12 observability baseline and durable persistence model | C1, C2 prerequisites | docs, models |
| P12-03 | Introduce shared observability contracts and models | C1, C2, C4 prerequisites | `packages/models` |
| P12-04 | Implement durable persistence adapters and storage plumbing | C1, C2 | `backend/functions` |
| P12-05 | Build backend ingestion/query/action APIs | C4, C5 | `backend/functions` |
| P12-06 | Harden probe execution and alert evaluation | C6, C7 | `@hbc/features-admin`, `backend/functions` |
| P12-07 | Instrument cross-domain correlation and event emission | C8 | `backend/functions`, `@hbc/features-admin` |
| P12-08 | Implement SPFx unified observability surfaces and routing corrections | C3, C9 | `apps/admin` |
| P12-09 | Harden notification dispatch and operator action workflows | C10 | `@hbc/features-admin`, `backend/functions` |
| P12-10 | Testing, docs, runbooks, and config guidance | C11 | docs, tests |
| P12-11 | Phase 12 exit reconciliation and release readiness | C12 | docs |

---

## Validation checklist

- [x] All named file paths verified to exist (or confirmed absent where noted, e.g., `ProvisioningFailuresPage.tsx`)
- [x] Gap map does not present target-state claims as repo truth
- [x] Recommended breakdown remains Phase 12 only
- [x] Closures map to governing exit criteria
- [x] Non-gaps explicitly documented to prevent unnecessary rebuilds
- [x] Unresolved issues include recommended direction, not just problem statements

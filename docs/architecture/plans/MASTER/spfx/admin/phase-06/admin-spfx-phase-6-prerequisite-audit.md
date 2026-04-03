# Admin SPFx IT Control Center — Phase 6 Prerequisite Audit

**Prompt:** P6-01 — Prerequisite Audit and Compatibility Plan
**Status:** Complete
**Date:** 2026-04-03
**Purpose:** Audit the live repo to determine what Phase 6 substrate exists, what is missing, and what minimum compatibility scaffolding is needed for in-app backend install and bootstrap.

---

## 1. Purpose

Phase 6 delivers the first real **in-app backend install and bootstrap** lane. Before implementation begins, this audit confirms what reusable substrate Phases 1–5 established, identifies true blockers, and defines the smallest forward-compatible compatibility strategy so Phase 6 can proceed without reimplementing earlier phases.

---

## 2. Authority set actually used

### Documentation
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md` — 4-layer model
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-it-control-center-end-state-plan.md` — Phase 6 section
- `docs/architecture/plans/MASTER/spfx/admin/phase-05/admin-spfx-phase-5-exit-reconciliation.md` — recommended Phase 6 entry point
- `docs/architecture/plans/MASTER/spfx/admin/phase-06/Admin-SPFx-IT-Control-Center-Phase-6-Summary-Plan.md` — Phase 6 objectives and acceptance criteria

### Frontend
- `apps/admin/src/pages/SetupLanePage.tsx` — current scaffold
- `apps/admin/src/router/routes.ts` — route definitions
- `apps/admin/src/router/lane-registry.ts` — lane metadata

### Backend
- `backend/functions/src/services/admin-control-plane/adapters.ts` — adapter descriptors
- `backend/functions/src/services/admin-control-plane/adapter-registry.ts` — registry infrastructure
- `backend/functions/src/services/admin-control-plane/index.ts` — service exports
- `backend/functions/src/services/admin-control-plane/types.ts` — service interfaces
- `backend/functions/src/hosts/admin-control-plane/service-factory.ts` — container wiring
- `backend/functions/src/functions/adminApi/index.ts` — API endpoints
- `backend/functions/src/functions/health/index.ts` — health probes
- `backend/functions/src/config/wave0-env-registry.ts` — environment config

### Shared packages
- `packages/models/src/admin-control-plane/` — run, audit, adapter, checkpoint types

---

## 3. Confirmed repo facts relevant to Phase 6

| # | Fact | Source |
|---|------|--------|
| 1 | The Setup lane route (`/setup`) exists with `admin:access-control:view` permission guard | `apps/admin/src/router/routes.ts:89–95` |
| 2 | `SetupLanePage.tsx` is a scaffold placeholder linking to Health and noting Phase 6 delivery | `apps/admin/src/pages/SetupLanePage.tsx` |
| 3 | The admin shell is an 8-lane operator console with lane-driven navigation from `lane-registry.ts` | Phase 5 delivery |
| 4 | The admin control plane service container has 10 eager services (3 infra + 7 domain) | `service-factory.ts` |
| 5 | `AdminAdapterRegistry` has 10 registered descriptors including `azure-deployment:bicep` with domain `installBootstrap` | `adapters.ts` |
| 6 | Only `provisioning:bridge` has a real invoker; all other adapters are metadata-only | `adapters.ts` |
| 7 | Admin API has 13 HTTP endpoints; preflight and checkpoint are stubs, run lifecycle is wired | `adminApi/index.ts` |
| 8 | `DurableAdminRunStore`, `DurableAdminAuditStore`, `DurableAdminEvidenceStore` are production-ready Table Storage services | Phase 4 delivery |
| 9 | Health endpoint provides structured readiness probes (core config, SharePoint, Graph permissions, app catalog, SPFx app ID) | `health/index.ts` |
| 10 | Environment config registry already names Phase 6 vars: `SHAREPOINT_APP_CATALOG_URL`, `HB_INTEL_SPFX_APP_ID`, `GRAPH_GROUP_PERMISSION_CONFIRMED`, `SITES_SELECTED_GRANT_CONFIRMED` | `wave0-env-registry.ts` |
| 11 | `@hbc/features-admin` remains an admin-intelligence package, not the control plane | `packages/features/admin/README.md` |
| 12 | Production backend uses managed identity with `DefaultAzureCredential` | `backend/functions/README.md` |
| 13 | `ProvisioningAuditBridge` fire-and-forget pattern is reusable for an install audit bridge | Phase 4 delivery |
| 14 | `IAdminRunEnvelope` supports `AdminDomain` enum for multi-domain run discrimination | `packages/models/src/admin-control-plane/` |

---

## 4. What Phase 6-capable substrate already exists

### Frontend (Phase 5)

| Component | Status | Reuse for Phase 6 |
|-----------|--------|-------------------|
| Setup lane route `/setup` | Live | Route anchor for install workflow UI |
| `SetupLanePage.tsx` scaffold | Live | Replace with real install workflow page |
| Lane registry (`lane-registry.ts`) | Live | Setup lane metadata already defined |
| Operator landing page | Live | Links to Setup lane |
| Permission guard (`admin:access-control:view`) | Live | Reuse as-is |
| `WorkspacePageShell` layout system | Live | Use `layout: 'form'` or `'detail'` for install wizard |
| `HbcSmartEmptyState` pattern | Live | Reuse for conditional states in install flow |

### Backend (Phases 3–4)

| Component | Status | Reuse for Phase 6 |
|-----------|--------|-------------------|
| `AdminAdapterRegistry` + 10 descriptors | Live | Wire real invoker for `azure-deployment:bicep` |
| `DurableAdminRunStore` | Live | Persist install runs as `AdminDomain.InstallBootstrap` |
| `DurableAdminAuditStore` | Live | Record install audit events |
| `DurableAdminEvidenceStore` | Live | Capture install evidence (Bicep output, config snapshots) |
| `adminLaunchRun` endpoint | Live | Launch install runs |
| `adminGetRun` / `adminListRuns` endpoints | Live | Track install run status |
| `adminCancelRun` / `adminRetryRun` endpoints | Live | Cancel/retry install runs |
| `adminListRunAuditEvents` / `adminGetRunEvidence` | Live | Review install audit trail |
| `adminPreview` endpoint (dry-run) | Live | Preview install plan without executing |
| Health probes | Live | Reuse readiness checks in preflight validator |
| `ProvisioningAuditBridge` pattern | Live | Model for install audit bridge |
| Managed identity + `DefaultAzureCredential` | Live | Auth for Azure Resource Manager, Graph, SharePoint calls |
| `wave0-env-registry.ts` | Live | Phase 6 env vars already registered |

### Shared types (Phase 2)

| Component | Status | Reuse for Phase 6 |
|-----------|--------|-------------------|
| `IAdminRunEnvelope` / `AdminRunStatus` | Live | Run lifecycle for install runs |
| `IAdminAuditRecord` / `AdminAuditEventType` | Live | Audit events for install steps |
| `IAdminEvidenceReference` / `EvidenceRetentionClass` | Live | Evidence capture for install artifacts |
| `AdminDomain` enum | Live | Add `InstallBootstrap` domain value if not present |
| `IAdminStepResult` / `IAdminFailureSummary` | Live | Step results for install steps |
| `IAdminActorContext` | Live | Operator attribution for install actions |

---

## 5. What is missing

### True blockers (must be created in Phase 6)

| # | Missing item | Why it blocks | Target prompt |
|---|-------------|---------------|---------------|
| 1 | Install/bootstrap step sequence definition | No install workflow can execute without a defined step model | P6-02 |
| 2 | Real preflight validation logic | `StubAdminPreflightService` returns stub — install cannot validate readiness | P6-04 |
| 3 | Install orchestration service | No code coordinates install step execution, checkpoint pausing, or resume | P6-05 |
| 4 | `azure-deployment:bicep` adapter invoker | Descriptor exists but has no implementation — cannot deploy infrastructure | P6-05 |
| 5 | Bicep/ARM templates for HB Intel infrastructure | No IaC exists for Function App, Storage Account, or app registrations | P6-05 |
| 6 | Checkpoint resume/cancel implementation | `adminCheckpointDecision` endpoint is stub — manual approval gates cannot function | P6-06 |
| 7 | Post-install verification flow | No verification logic confirms environment health after install | P6-07 |
| 8 | Setup/install workflow UI | `SetupLanePage.tsx` is a placeholder — no wizard, preflight display, or run tracking | P6-08/09 |

### Not blockers (can proceed without or scaffold minimally)

| # | Missing item | Why not a blocker | Approach |
|---|-------------|-------------------|----------|
| 1 | `adminListActions` returns empty | Install flow launches specific known actions, not a dynamic catalog | Skip — not needed for P6 |
| 2 | SignalR real-time progress push | Install runs can use polling via `adminGetRun` until SignalR is wired | Poll initially; wire SignalR in a later phase |
| 3 | `sharepoint-alm:package-install` invoker | SPFx package install is a step within the install sequence; can be added incrementally | Create invoker as part of P6-05 step implementation |
| 4 | `sharepoint-api-access:permissions` invoker | API permission consent may require manual approval checkpoint | Create invoker or model as checkpoint in P6-05/06 |
| 5 | Config version snapshotting | Phase 10 deliverable; install can capture evidence without snapshot service | Skip — use evidence service directly |

---

## 6. Blocker vs compatibility scaffolding classification

| Item | Classification | Rationale |
|------|---------------|-----------|
| Install step model | **True blocker** | Cannot build orchestration or UI without step definitions |
| Preflight validator | **True blocker** | Cannot safely launch install without readiness checks |
| Install orchestration | **True blocker** | Cannot execute install steps without coordinator |
| Bicep/ARM templates | **True blocker** | Cannot deploy infrastructure without IaC |
| Adapter invokers | **True blocker** | Cannot execute platform operations without invokers |
| Checkpoint implementation | **True blocker** | Manual approval gates are required by end-state plan |
| Post-install verification | **True blocker** | End-state exit criteria requires post-install health check |
| Install workflow UI | **True blocker** | Operator must be able to initiate, monitor, and review |
| SignalR progress | **Compatibility scaffold** | Polling via existing run-status endpoints is sufficient initially |
| Action catalog | **Not needed** | Install flow uses specific known actions |
| Config snapshotting | **Not needed** | Evidence service captures install artifacts directly |

---

## 7. Recommended compatibility strategy

### Principle: extend, don't rebuild

Phase 6 should extend the Phases 3–5 substrate rather than reimplementing it:

1. **Reuse run lifecycle** — Launch install runs through existing `adminLaunchRun` with `domain: 'installBootstrap'`. Track via existing `adminGetRun`/`adminListRuns`. No new run endpoints needed.

2. **Reuse audit/evidence** — Record install events through `DurableAdminAuditStore` and capture install artifacts through `DurableAdminEvidenceStore`. No new persistence services needed.

3. **Replace preflight stub** — Implement `IAdminPreflightService` with real validation logic that reuses health-probe readiness checks. The endpoint and service interface already exist.

4. **Wire adapter invokers** — Add real invokers to the existing `azure-deployment:bicep`, `sharepoint-alm:package-install`, and `sharepoint-api-access:permissions` adapter descriptors. The registry infrastructure is ready.

5. **Implement checkpoint** — Wire `adminCheckpointDecision` endpoint to real checkpoint resolution logic in the run service. The endpoint, route, and type contracts already exist.

6. **Build install orchestration** — Create an install-specific orchestration service that coordinates step execution through the adapter registry, similar to how `ProvisioningAuditBridge` coordinates provisioning events.

7. **Replace Setup lane scaffold** — Replace `SetupLanePage.tsx` with a real setup wizard that calls preflight, previews install plan, launches run, and tracks progress via polling.

8. **Poll for progress initially** — Use `adminGetRun` polling (30-second interval, consistent with existing alert polling) instead of SignalR. Wire SignalR in a later phase.

### What NOT to do

- Do not create new API endpoints for install — existing admin API surface is sufficient
- Do not create new persistence services — existing stores support multi-domain runs
- Do not modify `@hbc/features-admin` — it remains admin intelligence, not install control plane
- Do not move privileged execution into SPFx
- Do not rewrite the adapter registry or service container

---

## 8. Explicit non-goals

| Non-goal | Reason |
|----------|--------|
| Full tenant-wide SharePoint governance | Phase 7+ scope |
| Broad Entra admin workflow | Phase 9+ scope |
| Full standards/config registry | Phase 10+ scope |
| Full observability/alerting completion | Later phase scope |
| Generalized platform rewrite | Phase 6 is scoped to install/bootstrap only |
| SignalR real-time progress | Polling is sufficient initially |
| Dynamic action catalog | Install flow uses specific known actions |
| Config version snapshotting | Phase 10 deliverable |
| Reimplementing Phases 2–5 substrate | Extend existing substrate instead |

---

## 9. Recommended execution sequence for remaining Phase 6 prompts

| Prompt | Title | Scope |
|--------|-------|-------|
| P6-02 | Install/Bootstrap Architecture and Step Model | Freeze the install step sequence, step types, checkpoint policy, and domain model |
| P6-03 | Shared Contracts and Persistence Slice | Add install-specific types to `@hbc/models`, ensure `AdminDomain` includes `InstallBootstrap` |
| P6-04 | Backend Preflight Validation Engine | Replace `StubAdminPreflightService` with real readiness validator reusing health-probe logic |
| P6-05 | Backend Install/Bootstrap Orchestration | Create install orchestration service, wire adapter invokers, add Bicep templates |
| P6-06 | Checkpoint/Resume and Manual Action Flow | Implement `adminCheckpointDecision` with real resolution logic, checkpoint state machine |
| P6-07 | Post-Install Verification and Health Checks | Implement post-install verification flow reusing health probes and adapter readiness checks |
| P6-08 | SPFx Setup Wizard and Preflight UX | Replace `SetupLanePage.tsx` with real setup wizard, preflight display, install launch |
| P6-09 | SPFx Run Tracking, Checkpoint, and Verification UX | Build run status polling, checkpoint approval UI, verification results display |
| P6-10 | Docs, Runbooks, Validation, and Final Reconciliation | Reconcile documentation, create operator runbook, validate, exit reconciliation |

### Dependencies between prompts

- P6-02 (step model) must complete before P6-04/05/06 (backend implementation)
- P6-03 (shared contracts) must complete before P6-04/05 (backend services consume types)
- P6-04 (preflight) and P6-05 (orchestration) can partially overlap but P6-05 depends on step model from P6-02
- P6-06 (checkpoint) depends on orchestration from P6-05
- P6-07 (verification) depends on orchestration from P6-05
- P6-08/09 (frontend) depend on backend APIs from P6-04/05/06/07
- P6-10 (reconciliation) is always last

---

## Cross-references

- [End-state plan — Phase 6](../admin-spfx-it-control-center-end-state-plan.md) — deliverables and exit criteria
- [Phase 6 Summary Plan](Admin-SPFx-IT-Control-Center-Phase-6-Summary-Plan.md) — objectives, acceptance criteria, non-goals
- [Target Architecture](../admin-spfx-target-architecture.md) — 4-layer model (operator console → API → orchestrator → adapters)
- [Phase 5 Exit Reconciliation](../phase-05/admin-spfx-phase-5-exit-reconciliation.md) — recommended Phase 6 entry point
- [Phase 4 Exit Reconciliation](../phase-04/admin-spfx-phase-4-exit-reconciliation.md) — backend APIs available
- [RELEASE-SCOPE.md](../../../../backend/functions/src/hosts/admin-control-plane/RELEASE-SCOPE.md) — admin control plane boundary manifest

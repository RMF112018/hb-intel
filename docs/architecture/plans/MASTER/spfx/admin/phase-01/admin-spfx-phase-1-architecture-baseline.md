# Admin SPFx IT Control Center — Phase 1 Architecture Baseline

## 1. Purpose

This is the canonical Phase 1 architecture baseline for the Admin SPFx IT Control Center. It defines the operating model — what belongs where, what the layers are, what each layer owns, and how the current repo maps to that model.

All later Phase 1 artifacts (boundary matrix, domain taxonomy, locked decisions, release-scope map) are built on top of this baseline. Later implementation phases (2–13) must respect these boundaries unless a deliberate ADR supersedes them.

## 2. Why Phase 1 exists

The Admin SPFx app must evolve from a provisioning-focused admin surface into a full IT Control Center. Without a locked boundary model, later phases will:

- place logic in the wrong layer,
- duplicate control-plane behavior in the browser,
- blur the role of reusable packages,
- create governance contradictions across docs,
- hard-code assumptions into the wrong app or package.

Phase 1 freezes the operating model. It does not add runtime capability.

## 3. Current foundations already in repo

Verified in the [repo-truth verification artifact](admin-spfx-phase-1-repo-truth-verification.md). Summary:

### apps/admin
- Working SPFx entry point with RBAC bootstrap (D-PH7-BW-7).
- 4 routed pages: SystemSettings (live), ProvisioningOversight (live, production-grade), OperationalDashboard (live), ErrorLog (placeholder, SF17-T05).
- Permission gating on all non-index routes (`admin:access-control:view` or `*:*`).
- Alert/probe polling in root route.
- Complexity tier gating (Essential, Standard, Expert).

### @hbc/features-admin (v0.2.1)
- Admin intelligence layer: monitors, probes, APIs, hooks, integrations, components.
- Ports-and-adapters architecture per ADR-0106.
- Wave 0: in-memory stores, 2/6 monitors live, 2/5 probes live.

### backend/functions
- Service factory with dual-mode (mock/proxy) and lazy CRUD initialization.
- Production-grade saga orchestrator: 7-step provisioning, retry, compensation, durable run identity, Step 5 deferral, dual-store audit, SignalR progress, escalation notifications.
- Graph service: Entra group lifecycle, gated by IT confirmation env var.
- SharePoint service: full provisioning contract, PnPjs + Managed Identity.
- Table storage service: Azure Table-backed persistence with deserialization boundary.

### Target architecture document
- ASCII diagram only. Directionally correct but too thin for baseline use. Phase 1 enriches it (Prompt-06).

## 4. Canonical operating model

The Admin SPFx IT Control Center has five architectural layers. Each has clear ownership boundaries.

### 4.1 SPFx operator console

The Admin SPFx app is the **operator console**. It is the human-facing shell where authorized admins observe, initiate, and manage IT control actions.

**Owns**:
- Navigation and information architecture for operator workflows.
- Setup/install workflow UX.
- Validation and preflight UX.
- Run initiation (trigger, not execute).
- Run history, logs, status, and health visibility.
- Operator approvals and checkpoint UX.
- Standards/configuration visibility and management UX.
- Entra and SharePoint control UX.
- Alert, probe, and drift visibility.
- Repair initiation UX.
- Complexity-tier gating of feature exposure.

**Does not own**: Privileged execution, orchestration, retries, compensation, durable state, or audit persistence internals.

### 4.2 Privileged backend / control plane

The backend is the **privileged executor**. It performs actions that require elevated permissions, long-running orchestration, or durable state management.

**Owns**:
- Authenticated admin API layer.
- Durable orchestration (workflow state, step sequencing, checkpoints).
- Retry semantics.
- Compensation semantics.
- Repair decision logic.
- Command routing and adapter invocation.
- Durable run persistence.
- Durable audit persistence.
- Configuration resolution and versioning.
- Post-run evidence recording.
- Escalation handling.
- Progress signaling (SignalR).

**Current implementation**: The saga orchestrator in `backend/functions` is the existing control-plane seed. Later phases generalize it beyond provisioning.

### 4.3 Adapter layer

Adapters isolate platform-specific execution logic from the orchestrator.

**Owns**:
- Azure resource deployment/bootstrap (Bicep/ARM).
- Entra ID / Microsoft Graph operations.
- SharePoint ALM and package control.
- SharePoint API approval posture.
- Validation probes and environment checks.
- Standards application, reapplication, and repair primitives.

**Current implementation**: `graph-service.ts` and `sharepoint-service.ts` are existing adapters. The service factory manages their lifecycle. Later phases add new adapters (Azure Deployment, Validation) and generalize the adapter registry.

### 4.4 Run / audit persistence

Run and audit data must be durable, reconstructable, and defensible.

**Owns**:
- Run identity and correlation chains.
- Input snapshots.
- Step-level results.
- Checkpoint records.
- Final outputs.
- Failure evidence.
- Escalation records.
- Retention boundaries.

**Current implementation**: `table-storage-service.ts` provides Azure Table-backed run persistence for provisioning. Later phases generalize this to cover all admin domain runs.

### 4.5 Standards / configuration governance

Standards and configuration are a first-class concern, not a side note.

**Owns**:
- Code-defined defaults.
- Live admin-maintained governed config (where appropriate).
- Config versioning.
- Config audit trail.
- Config-to-run traceability.
- Drift detection tied to active standards state.

**Current implementation**: Not yet implemented as a standalone capability. Provisioning has implicit config (template files, data list schemas). Phase 10 builds the explicit governance model.

## 5. Responsibilities by layer

| Responsibility | SPFx console | Backend / control plane | Adapters | Persistence | Config governance |
|---|---|---|---|---|---|
| Operator navigation and UX | **owns** | — | — | — | — |
| Run initiation (trigger) | **owns** | receives | — | — | — |
| Run execution | — | **owns** | invoked by | — | — |
| Retry / compensation | — | **owns** | — | — | — |
| Checkpoint approval UX | **owns** | pauses for | — | — | — |
| Checkpoint enforcement | — | **owns** | — | — | — |
| Privileged Graph writes | — | — | **owns** | — | — |
| Privileged SharePoint admin | — | — | **owns** | — | — |
| Durable run state | — | writes | — | **owns** | — |
| Audit persistence | — | writes | — | **owns** | — |
| Run history visibility | **owns** (read) | API | — | queried | — |
| Alert/probe visibility | **owns** | — | — | — | — |
| Monitor/probe execution | `@hbc/features-admin` | — | — | — | — |
| Standards defaults | — | resolves | — | — | **owns** |
| Live config management UX | **owns** | — | — | — | — |
| Config versioning/audit | — | — | — | — | **owns** |
| Drift detection | — | computes | — | — | references |

## 6. Explicit out-of-boundary items for SPFx

The SPFx operator console must **not** directly own:

- Privileged Microsoft Graph write operations (group creation, role assignment, app registration changes).
- Privileged SharePoint admin execution (site creation, hub association, ALM package deployment, API access approval).
- Long-running orchestration or workflow state.
- Retry logic or retry policy decisions.
- Compensation logic or rollback decisions.
- Durable run state management or persistence internals.
- Audit persistence internals.
- Sensitive deployment execution logic.
- Configuration resolution or versioning internals (visibility and management UX is allowed; the source-of-truth engine is not).

SPFx may call backend APIs to **trigger** these actions and **read** their results. It must not **execute** them.

## 7. How current repo packages/apps map to the baseline

### apps/admin → Operator console shell

The admin app is already the operator console. Its current scope is provisioning-focused (oversight, system settings, dashboards). Later phases expand it into the full control-center workflow shell (install, validation, SharePoint control, Entra control, standards, health, error/audit).

### @hbc/features-admin → Admin intelligence layer

This package is a reusable admin-intelligence layer. It provides monitors, probes, APIs, hooks, and dashboard components. It is **not** the privileged control plane and must not be expanded into one.

Key boundary: `@hbc/features-admin` may contain observation, alerting, and intelligence logic. It must not contain privileged execution, orchestration, or durable state management.

### @hbc/ui-kit → Reusable visual components

Reusable visual UI components belong in `@hbc/ui-kit`. Feature packages and apps compose these components. Feature packages do not create duplicate reusable visual primitives.

### backend/functions → Control plane seed

The backend already contains the provisioning saga, service factory, Graph/SharePoint adapters, and Azure Table persistence. This is the **seed crystal** for the broader admin control plane.

Later phases generalize the saga pattern into a reusable admin orchestration engine, add new API endpoints, and extend the adapter registry. The correct approach is to **generalize** these foundations, not to discard and rebuild them.

### Provisioning foundations → Seed crystal for generalization

The existing provisioning foundations (`@hbc/provisioning`, saga orchestrator, service adapters, run persistence, SignalR progress) demonstrate the target pattern at production quality. They prove:

- Durable run identity with correlation chains works.
- Step-based orchestration with retry and compensation works.
- Dual-mode service factory (mock/proxy) works.
- Adapter isolation works.
- Dual-store audit writes (fire-and-forget) work.
- Real-time progress signaling works.

Later phases use these as the model for generalized admin domain runs.

## 8. Phase 1 boundary implications for later phases

- **Phase 2** (contracts): Must define run, action, checkpoint, and audit contracts that respect this layer model.
- **Phase 3** (backend): Must generalize the provisioning backend pattern, not create a parallel execution path.
- **Phase 4** (persistence): Must generalize Table Storage persistence, not introduce a competing store.
- **Phase 5** (console): Must rework the operator console IA around the domain taxonomy, not add ad hoc pages.
- **Phase 6** (install): Must use the backend for privileged bootstrap execution, not push install logic into SPFx.
- **Phases 7–13**: Must respect SPFx as operator console, backend as executor, adapters as platform isolation.

Any phase that needs to change these boundaries must do so through a deliberate ADR, not by silent drift.

## 9. No-go implementation patterns

The following patterns are explicitly prohibited:

| Pattern | Why |
|---------|-----|
| Moving privileged Graph/SharePoint writes into SPFx | Violates operator-console boundary. Security and auditability risk. |
| Making `@hbc/features-admin` the privileged executor | Collapses the intelligence/execution boundary. Creates a pseudo-control-plane in a reusable package. |
| Flattening all admin actions into one generic page | Destroys workflow-oriented UX. Makes the control center unusable at scale. |
| Discarding existing saga/backend foundations | Wastes proven production-grade work. Creates inconsistency between provisioning and other admin domains. |
| Implementing retry/compensation in the browser | Fragile. Loses state on page close. Cannot guarantee completion. |
| Storing durable run/audit state in browser-side stores | Non-durable. Cannot reconstruct actions after session ends. |
| Treating standards/config as an afterthought | First-class governance is a locked decision. Config-to-run traceability is mandatory. |
| Skipping auditability because single-admin approval is fast | Single-admin execution makes auditability more important, not less. |

## 10. Cross-links to other Phase 1 artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Repo-truth verification | [admin-spfx-phase-1-repo-truth-verification.md](admin-spfx-phase-1-repo-truth-verification.md) | Created (P1-01) |
| Architecture baseline | This document | Created (P1-02) |
| Boundary matrix | `admin-spfx-boundary-matrix.md` | Pending (Prompt-03) |
| Domain taxonomy | `admin-spfx-domain-taxonomy.md` | Pending (Prompt-04) |
| Release-scope map | `admin-spfx-release-scope-map.md` | Pending (Prompt-04) |
| Locked decisions and boundary guards | `admin-spfx-locked-decisions-and-phase-boundary-guards.md` | Pending (Prompt-05) |
| Target architecture (enriched) | `../admin-spfx-target-architecture.md` | Update pending (Prompt-06) |

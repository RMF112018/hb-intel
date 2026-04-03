# Admin SPFx IT Control Center — Architecture Docs

## What this folder contains

This folder holds the architecture, doctrine, and phased implementation plan for the **Admin SPFx IT Control Center** — the operator console and privileged control plane for HB Intel IT administration.

## Key documents

### Target architecture

- [admin-spfx-target-architecture.md](admin-spfx-target-architecture.md) — Architecture diagram and layer summary. Not the complete doctrine by itself — see Phase 1 baseline.
- [admin-spfx-it-control-center-end-state-plan.md](admin-spfx-it-control-center-end-state-plan.md) — End-state product plan with 13 implementation phases, locked decisions, and developer boundaries.

### Phase 1 — Boundary hardening and program baseline

Phase 1 freezes the operating model. It does not add runtime capability.

| Artifact | Purpose |
|----------|---------|
| [Phase 1 Summary Plan](phase-01/Admin-SPFx-IT-Control-Center-Phase-1-Summary-Plan.md) | Objectives, deliverables, acceptance criteria |
| [Phase 1 Prompt Package README](phase-01/README.md) | Execution order and authority posture |
| [Repo-Truth Verification](phase-01/admin-spfx-phase-1-repo-truth-verification.md) | Verified present-state facts (P1-01) |
| [Architecture Baseline](phase-01/admin-spfx-phase-1-architecture-baseline.md) | Canonical 5-layer operating model (P1-02) |
| [Boundary Matrix](phase-01/admin-spfx-boundary-matrix.md) | Capability-to-layer ownership table (P1-03) |
| [Domain Taxonomy](phase-01/admin-spfx-domain-taxonomy.md) | 10 admin domains with maturity (P1-04) |
| [Release-Scope Map](phase-01/admin-spfx-release-scope-map.md) | Active / advisory / later expansion tiers (P1-04) |
| [Locked Decisions & Guards](phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md) | 10 locked decisions, 10 boundary guards (P1-05) |

### Phase 2 — Admin control-plane contracts and domain model

Phase 2 defines stable shared contracts for the generalized admin control plane. Shared types live in `@hbc/models/admin-control-plane`.

| Artifact | Purpose |
|----------|---------|
| [Phase 2 Summary Plan](phase-02/Admin-SPFx-IT-Control-Center-Phase-2-Summary-Plan.md) | Objectives, deliverables, acceptance criteria |
| [Phase 2 Prompt Package README](phase-02/README.md) | Execution order and authority posture |
| [Prerequisite & Contract Inventory](phase-02/admin-spfx-phase-2-prereq-and-contract-inventory.md) | Current contract surfaces and gap analysis (P2-01) |
| [Action Catalog](phase-02/admin-control-plane-action-catalog.md) | 8 domains, 40+ actions, risk levels, execution modes (P2-02) |
| [Run Model](phase-02/admin-control-plane-run-model.md) | Run envelope, lifecycle states, provisioning crosswalk (P2-03) |
| [API Contract Catalog](phase-02/admin-control-plane-api-contract-catalog.md) | 11 endpoint contracts with DTOs (P2-04) |
| [Checkpoint & Execution Modes](phase-02/admin-control-plane-checkpoint-and-execution-modes.md) | Checkpoint lifecycle, categories, timeout/escalation (P2-05) |
| [Audit/Evidence/Config Contracts](phase-02/admin-control-plane-audit-evidence-and-config-contracts.md) | Audit records, evidence refs, config traceability (P2-06) |
| [Adapter Registry Contract](phase-02/admin-control-plane-adapter-registry-contract.md) | Adapter descriptor, invocation, normalized results (P2-07) |
| [Package Placement & Boundary Map](phase-02/admin-control-plane-package-placement-and-boundary-map.md) | Contract placement rules and import direction (P2-08) |
| [Decision Register](phase-02/admin-control-plane-phase-2-decision-register.md) | 14 Phase 2 decisions with rationale |

### Phase 3 — Privileged backend foundation

Phase 3 establishes the generalized admin backend host, service container, API surface, adapter registry, orchestration bridge, and authorization wiring.

| Artifact | Purpose |
|----------|---------|
| [Phase 3 Summary Plan](phase-03/Admin-SPFx-IT-Control-Center-Phase-3-Summary-Plan.md) | Objectives, deliverables, acceptance criteria |
| [Phase 3 Prompt Package README](phase-03/README.md) | Execution order and authority posture |
| [Runtime Foundation Inventory](phase-03/admin-spfx-phase-3-runtime-foundation-inventory.md) | Current backend foundations audit (P3-01) |
| [Host & Composition-Root Plan](phase-03/admin-control-plane-host-and-composition-root-plan.md) | Domain host strategy (P3-02) |
| [Service Factory & Container Plan](phase-03/admin-control-plane-service-factory-and-container-plan.md) | 9-service container design (P3-03) |
| [API Surface & Route Catalog](phase-03/admin-control-plane-api-surface-and-route-catalog.md) | 13 admin API endpoints (P3-04, P4-05) |
| [Adapter Registry & Routing](phase-03/admin-control-plane-adapter-registry-and-routing-foundation.md) | 10 adapter descriptors (P3-06) |
| [Orchestration Bridge Plan](phase-03/admin-control-plane-orchestration-bridge-plan.md) | Provisioning-to-admin mapping (P3-07) |
| [Authz/Config/Safety Plan](phase-03/admin-control-plane-authz-config-and-operational-safety-plan.md) | Route-level authorization matrix (P3-08) |
| [Decision Register](phase-03/admin-control-plane-phase-3-decision-register.md) | 11 Phase 3 decisions |
| [Validation Report](phase-03/admin-control-plane-phase-3-validation-report.md) | Exit reconciliation (P3-10) |

### Phase 4 — Durable run history, audit spine, and evidence model

Phase 4 replaces in-memory stores with durable Table Storage persistence for runs, audit events, and evidence metadata.

| Artifact | Purpose |
|----------|---------|
| [Phase 4 Summary Plan](phase-04/Admin-SPFx-IT-Control-Center-Phase-4-Summary-Plan.md) | Objectives, deliverables, acceptance criteria |
| [Phase 4 Prompt Package README](phase-04/README.md) | Execution order and authority posture |
| [Repo-Truth Audit](phase-04/admin-spfx-phase-4-repo-truth-audit.md) | Provisioning persistence inventory (P4-01) |
| [Run/Audit/Evidence Baseline](phase-04/admin-spfx-phase-4-run-audit-evidence-baseline.md) | Canonical model and doctrine (P4-02) |
| [Persistence Boundary Matrix](phase-04/admin-spfx-phase-4-persistence-boundary-matrix.md) | Store ownership and boundary rules (P4-02) |
| [Store Implementation Notes](phase-04/admin-spfx-phase-4-store-implementation-notes.md) | Durable store keying and serialization (P4-03) |
| [Provisioning Bridge](phase-04/admin-spfx-phase-4-provisioning-bridge.md) | Saga-to-spine event mapping (P4-04) |
| [Retrieval API Contract](phase-04/admin-spfx-phase-4-retrieval-api-contract.md) | Audit/evidence query endpoints (P4-05) |
| [Evidence & Retention Boundaries](phase-04/admin-spfx-phase-4-evidence-and-retention-boundaries.md) | Inline/offload thresholds, retention classes (P4-06) |

### Phase 5–8 — Operator console, install wizard, app-binding, SharePoint control

Phases 5–8 delivered the operator console shell, install wizard with checkpoint approval, app-binding management, and SharePoint control lane (drift detection, preview/repair, posture). See individual phase folders for artifacts.

### Phase 9 — Hybrid Identity Administration foundation

Phase 9 delivers the **Hybrid Identity control lane** — authority-aware user lifecycle administration with AD DS and Entra/Graph as distinct sources of authority, no-code connection management, risk-aware execution UX, audit-backed workflows, and sync-status visibility.

This phase was **redirected** from the original "broad Entra administration" target to a hybrid identity model where AD DS is authoritative for synced users and Graph handles cloud-only objects.

**Hard gate**: After `.sppkg` delivery, IT must complete setup without code edits.

| Artifact | Purpose |
|----------|---------|
| [Phase 9 Summary Plan](phase-09/Admin-SPFx-IT-Control-Center-Phase-9-Summary-Plan.md) | Objectives, redirect thesis, acceptance criteria |
| [Phase 9 Prompt Package README](phase-09/README.md) | Implementation status, execution order, cross-links |
| [Action Catalog](phase-09/admin-spfx-phase-9-identity-action-catalog.md) | 26 implement-now actions with risk and authority |
| [Source-of-Authority Matrix](phase-09/admin-spfx-phase-9-source-of-authority-matrix.md) | AD DS vs Entra routing rules |
| [Risk Taxonomy](phase-09/admin-spfx-phase-9-risk-taxonomy.md) | 5 risk tiers with confirmation requirements |
| [Permission Matrix](phase-09/admin-spfx-phase-9-permission-access-role-and-consent-matrix.md) | Graph permissions and AD DS delegation |
| [Connection Dependency Matrix](phase-09/admin-spfx-phase-9-connection-dependency-matrix.md) | Required connectors per action |
| [Env & Prerequisites](phase-09/admin-spfx-phase-9-env-and-prerequisites.md) | External prerequisites and setup guidance |
| [Operator Runbook](phase-09/admin-spfx-phase-9-operator-runbook.md) | Operator reference for hybrid identity lane |
| [IT Handoff Guide](phase-09/admin-spfx-phase-9-it-handoff-and-setup-guide.md) | No-code setup instructions for IT |
| [Ripple Update Summary](phase-09/Admin-SPFx-IT-Control-Center-Phase-9-Ripple-Update-Summary-Plan.md) | Program-wide alignment for hybrid identity redirect |

### Later phases

Phases 10–13 are defined in the [end-state plan](admin-spfx-it-control-center-end-state-plan.md). Implementation artifacts will be added as work begins.

## Quick orientation

- **Operator console** = `apps/admin` (SPFx). Observe, initiate, manage.
- **Admin intelligence** = `@hbc/features-admin`. Monitors, probes, hooks, dashboards.
- **Privileged control plane** = `backend/functions`. Orchestration, retries, adapters, persistence.
- **Reusable visual UI** = `@hbc/ui-kit`. Shared components.

For boundary rules, see the [boundary matrix](phase-01/admin-spfx-boundary-matrix.md). For locked decisions, see [locked decisions](phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md).

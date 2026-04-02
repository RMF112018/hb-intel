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

### Later phases

Phases 3–13 are defined in the [end-state plan](admin-spfx-it-control-center-end-state-plan.md). Implementation artifacts for those phases will be added as work begins.

## Quick orientation

- **Operator console** = `apps/admin` (SPFx). Observe, initiate, manage.
- **Admin intelligence** = `@hbc/features-admin`. Monitors, probes, hooks, dashboards.
- **Privileged control plane** = `backend/functions`. Orchestration, retries, adapters, persistence.
- **Reusable visual UI** = `@hbc/ui-kit`. Shared components.

For boundary rules, see the [boundary matrix](phase-01/admin-spfx-boundary-matrix.md). For locked decisions, see [locked decisions](phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md).

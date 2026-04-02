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

### Later phases

Phases 2–13 are defined in the [end-state plan](admin-spfx-it-control-center-end-state-plan.md). Implementation artifacts for those phases will be added as work begins.

## Quick orientation

- **Operator console** = `apps/admin` (SPFx). Observe, initiate, manage.
- **Admin intelligence** = `@hbc/features-admin`. Monitors, probes, hooks, dashboards.
- **Privileged control plane** = `backend/functions`. Orchestration, retries, adapters, persistence.
- **Reusable visual UI** = `@hbc/ui-kit`. Shared components.

For boundary rules, see the [boundary matrix](phase-01/admin-spfx-boundary-matrix.md). For locked decisions, see [locked decisions](phase-01/admin-spfx-locked-decisions-and-phase-boundary-guards.md).

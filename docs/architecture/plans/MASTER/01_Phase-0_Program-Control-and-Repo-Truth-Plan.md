# Phase 0 — Program Control and Repo Truth Plan

**Document ID:** 01  
**Classification:** Phase Master Plan  
**Status:** Draft for working use  
**Primary Role:** Establish execution truth, readiness classification, and release rules before large-scale delivery

## 1. Purpose

Phase 0 is the preconstruction phase for the HB Intel development program. Its purpose is to make sure the team knows exactly what exists today, what is future-state only, what is safe to build on, what is blocked, and what is not allowed into production.

This phase is intentionally control-heavy and build-light. Its value is in preventing expensive rework, false assumptions, and accidental production drift.

## 2. Phase Objectives

- Establish a single execution baseline for present truth versus future intent.
- Classify all major apps, packages, integrations, and workflows by readiness.
- Lock architectural and release guardrails for the rest of the program.
- Identify Phase 1 entry blockers and remove ambiguity about what “production-ready” means.
- Create the governing readiness matrix and handoff package for the delivery program.

## 3. Desired End State

At the end of Phase 0:
- there is one agreed current-state baseline
- there is one agreed interpretation of the target architecture
- every major package/app has a readiness status
- production restrictions are written down and enforceable
- the program knows what must happen first in Phase 1

## 4. In Scope

- Source-of-truth reconciliation across current-state map, target blueprint, ADRs, package docs, and live repo structure
- Readiness classification of apps, packages, shared primitives, integrations, and backend components
- Boundary rule confirmation (UI ownership, feature-package rules, dependency direction, production path restrictions)
- Environment and promotion policy definition
- Decision log creation for unresolved architectural and product curation items
- Phase 1 entry criteria definition

## 5. Out of Scope

- Major new feature buildout
- Large UI redesign work
- Completion of production adapters
- Full domain workflow implementation
- Final tenant / production rollout execution

## 6. Phase Workstreams

### 6.1 Workstream A — Truth Reconciliation
**Goal:** align documents and live repo reality.

**Activities**
- Review current-state map and verify it matches the live repo at a meaningful control-point level.
- Review target blueprint and mark which items are future-state intent versus already implemented foundations.
- Reconcile any contradictions across planning docs, package READMEs, dependency declarations, and CI/CD workflows.
- Record all divergences as one of: intentional evolution, not-yet-implemented plan, or superseded approach.

**Deliverables**
- Current-state reconciliation memo
- Divergence log
- Canonical planning hierarchy statement

### 6.2 Workstream B — Readiness Classification
**Goal:** classify what is real, partial, scaffolded, or blocked.

**Activities**
- Inventory all major apps, packages, backend services, and integrations.
- Assign each item a maturity label such as: production-ready, usable but incomplete, scaffold-only, blocked, or excluded from production path.
- Flag any item that is depended on by production-facing work but is not mature enough.
- Identify packages that can be used only behind a feature flag or only in dev/test.

**Deliverables**
- Production readiness matrix
- Maturity classification rubric
- Blocker list for critical dependencies

### 6.3 Workstream C — Boundary and Governance Rule Lock
**Goal:** make architectural rules explicit and enforceable.

**Activities**
- Confirm shared UI ownership and component-creation rules.
- Confirm feature-package boundary rules and cross-feature dependency restrictions.
- Confirm what constitutes an unacceptable production dependency (mock adapter, placeholder integration, scaffold runtime, etc.).
- Define approval authority for exceptions.

**Deliverables**
- Development guardrail sheet
- Exception-handling process
- Updated architecture governance checklist

### 6.4 Workstream D — Release and Environment Control
**Goal:** prevent promotion confusion later.

**Activities**
- Define environment roles (dev, integration, staging, production, demo/sandbox if retained).
- Define promotion gates between environments.
- Clarify which artifacts can be deployed where.
- Identify missing CI/CD, validation, or security controls that must exist before broad delivery begins.

**Deliverables**
- Environment topology note
- Promotion criteria matrix
- Release-control gap list

### 6.5 Workstream E — Phase 1 Entry Definition
**Goal:** produce a clean notice-to-proceed for the real data plane phase.

**Activities**
- Identify all blockers to production adapter and backend completion.
- Clarify domain-by-domain source-of-record questions that affect Phase 1.
- Confirm test, telemetry, and observability expectations for Phase 1.
- Package unresolved decisions into an explicit queue instead of leaving them implicit.

**Deliverables**
- Phase 1 entry checklist
- Data-ownership decision queue
- Initial contract-completion backlog

## 7. Key Milestones

### M0.1 — Planning hierarchy confirmed
Source hierarchy and conflict-resolution rules are approved.

### M0.2 — Readiness matrix completed
All major apps/packages/integrations are classified.

### M0.3 — Guardrails approved
Boundary rules and production path restrictions are locked.

### M0.4 — Environment and promotion model defined
Release path is documented at a sufficient control level.

### M0.5 — Phase 1 entry package approved
The team has an explicit notice-to-proceed package for Phase 1.

## 8. Deliverables

Mandatory deliverables for Phase 0:
- Production Readiness Matrix
- Current-State Reconciliation Memo
- Divergence / Conflict Log
- Development Guardrail Sheet
- Environment and Promotion Criteria Matrix
- Phase 1 Entry Checklist
- Open Decisions and Idea-Curation Register

## 9. Dependencies

### Incoming dependencies
- Access to current planning docs and live repo truth
- Availability of architecture, platform, and delivery leads

### Outgoing dependencies
Phase 0 directly enables:
- Phase 1 data-plane completion
- accurate ownership assignment for later phases
- production path gating for all downstream work

## 10. Acceptance Gates

Phase 0 is complete only when:
- the team can clearly answer what is real today versus future-state only
- every major package/app has a readiness status and owner
- production restrictions are explicit, not implied
- exceptions have an approval path
- Phase 1 entry blockers are known and prioritized
- later phases can use the outputs without re-litigating baseline truth

## 11. Recommended Team Ownership

### Primary owner
Platform / Core Services Team

### Supporting owners
- DevSecOps / Enterprise Enablement
- Experience / Shell
- Project / Documents
- Business Domains

### Required reviewers
- Program architecture lead
- Delivery/program lead
- Release/governance lead

## 12. Decisions / Idea Curation Required

This phase should explicitly surface and curate the following:
- What exact maturity labels will be used across the program?
- What qualifies an app/package as “production-ready” versus “pilot-ready”?
- Which demo-oriented artifacts remain in the repo and how are they clearly isolated?
- How strict should exception handling be for teams that want to move faster than the platform baseline?
- How much documentation synchronization is required to declare repo truth reconciled?

## 13. Risks if Phase 0 is Skipped or Soft-Executed

- false confidence in incomplete packages
- mock-backed flows treated as production-capable
- duplicate or conflicting architectural assumptions
- downstream rework and sequencing errors
- inability to hold teams accountable to one truth set

## 14. Recommended First Actions

1. Run a controlled architecture/program review workshop.
2. Build the readiness matrix first; it is the most valuable control artifact.
3. Convert unresolved issues into a decision register, not hallway assumptions.
4. Close Phase 0 quickly but rigorously; do not let it become endless discovery.

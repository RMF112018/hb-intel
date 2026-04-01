# Phase 8 — Reliability, Testing, and Operational Readiness

## Package Purpose

This is the revised canonical Phase 8 prompt set for the Accounting-side Project Setup workflow, connected provisioning runtime, and admin/support verification surfaces.

Phase 8 is a **verification, degraded-path, and operational-readiness** phase. It is not a broad feature-build phase. Its job is to prove what the repo already evidences, close the highest-value remaining gaps, and state clearly what still depends on environment, tenant, Azure, or later-wave work.

## Canonical Copy Rule

Treat the repo-relative package path as canonical **only if the package has been committed there in the current workspace**:

- `docs/architecture/plans/MASTER/spfx/accounting/phase-8/`

Do not hard-code workstation-specific paths in findings or final docs.  
If duplicate package copies exist in the current workspace, record them explicitly and name which one was audited.  
If the package only exists as an attached artifact or local working draft, say so directly.

## Authority Order

Every prompt in this package must use this authority order:

1. live repo code and tests
2. `docs/architecture/blueprint/current-state-map.md`
3. current living verification/runbook/reference docs
4. historical plans and prior phase docs as drift evidence, not present-truth authority

## Current Repo-Truth Baseline That Motivates Phase 8

The live repo already contains substantial verification and supportability evidence. At minimum, Phase 8 must assume all of the following are already part of the current baseline:

- Accounting review queue/detail tests already verify controller actions, including project-number-gated approval and failed-only Admin routing.
- Admin oversight tests already verify retry/archive/escalation/force-state actions, permission gates, retry ceilings, expert diagnostics, and `?projectId=` context handoff.
- Alert polling tests already verify failure/stuck-run alert synthesis and severity escalation.
- The provisioning verification matrix already records Wave 0 evidence across lifecycle, clarification, failure/recovery, admin recovery, explainability, supportability, and dead-wiring audit.
- The maintenance runbooks already document operational retry, escalation, storage diagnostics, manual timer/step procedures, App Insights queries, and alert definitions.
- Some operational items remain intentionally out-of-repo or deferred, including Azure portal alert-rule creation and several Wave 1 monitor/probe/persistence enhancements.

These are starting facts, not optional background material.

## Required Working Rules For Every Prompt

- Treat the live repo as authoritative for implementation facts.
- Do not assume the current package language is correct just because it already exists.
- Do not re-read files already in active context unless needed to verify a contradiction, capture exact evidence, or confirm a change.
- Keep Phase 8 focused on verification, degraded behavior, observability, runbooks, and closure reporting.
- Do not silently convert repo-local deterministic proof into broader production-environment proof.
- Distinguish explicitly between:
  - repo-proven evidence
  - environment-gated validation
  - out-of-repo tenant/Azure prerequisites
  - intentionally deferred items
- Prefer updating existing authoritative docs and review artifacts over creating duplicate parallel docs.
- Do not mutate runtime behavior unless a prompt explicitly authorizes a narrow change that is necessary to keep verification or documentation truthful.

## Required Evidence Sources

Every prompt in this package must treat the following as primary evidence sources:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/verification-matrix.md`
- `docs/maintenance/provisioning-runbook.md`
- `docs/maintenance/provisioning-observability-runbook.md`

Also use the relevant live test files, support services, failure-mode registries, and admin monitors/probes named in the prompt set.

## Known Phase 8 Drift Risks

The revised package is specifically designed to prevent these mistakes:

- treating “launch” as vague controller-side language instead of the current approval-to-`ReadyToProvision` handoff plus backend auto-start model
- ignoring the verification matrix and rediscovering evidence from scratch
- overstating repo-local proof as tenant-ready or Azure-validated proof
- writing generic runbooks that drift away from the existing maintenance docs
- closing the phase without explicitly classifying remaining external blockers or deferred work

## Phase 8 Success Standard

Phase 8 is complete only when all of the following are true:

- the current verification/readiness evidence inventory has been audited against live repo truth
- the highest-value missing lifecycle / integration / degraded-path coverage has been closed or explicitly deferred
- supportability and observability docs have been reconciled against current repo behavior
- the closure report clearly distinguishes repo-proven readiness from environment-gated or out-of-repo dependencies
- intentionally deferred Wave 1 items are not falsely represented as complete
- later pilot/release work can start from one coherent readiness baseline instead of scattered or contradictory claims

## Execution Order

Execute the prompts in numeric order:

1. Prompt-01
2. Prompt-02
3. Prompt-03
4. Prompt-04
5. Prompt-05
6. Prompt-06

Do not skip order. Each prompt depends on the evidence, definitions, and narrowed scope produced by earlier prompts.

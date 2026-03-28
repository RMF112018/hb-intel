# Prompt 01 — Financial Repo-Truth Reconciliation Sweep

## Objective

Conduct a strict repo-truth reconciliation pass for the Financial module and correct any present-state documentation that overstates, understates, or ambiguously describes the actual implementation posture.

The goal of this prompt is **not** to implement new runtime behavior yet.
The goal is to make the repo tell the truth about the Financial module’s current state so downstream implementation work is governed by accurate documentation.

## Critical Instructions

- Work directly from repo truth.
- Inspect actual implementation files before changing plan language.
- Do not rely on assumptions, outdated summaries, or prior prompt outputs unless you verify them in the repo.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or capture exact evidence.
- Treat `docs/architecture/blueprint/current-state-map.md` as the governing present-state source when documents disagree.
- Preserve target-state doctrine where appropriate, but clearly separate it from current-state truth.
- Do not widen scope into full Financial implementation. This prompt is limited to **repo-truth reconciliation**.
- Every changed statement must be supportable by actual code, actual plan text, or both.

## Required Outcome

By the end of this prompt, the repo should accurately communicate:

1. what the Financial module currently does,
2. what is architecturally defined but not yet operational,
3. what is partially implemented,
4. what remains target-state only,
5. and where the current route / shell / lane / runtime posture still differs from the plan package.

## Files to Inspect First

### Governing present-state and phase files
- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/blueprint/Target-Architecture-Blueprint.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G1-Lane-Capability-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md`

### Financial doctrine files most relevant to reconciliation
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/`
- especially the Financial module operating posture, route/context contract, runtime seam model, runtime entity model, budget import readiness, and review/publication/export doctrine files

### Implementation surfaces to inspect before changing docs
- Financial routes/pages in `apps/pwa`
- any Project Hub host surfaces that render Financial
- `packages/features-project-hub`
- route-definition files
- project-context resolution files
- shell / navigation / handoff surfaces
- any Financial-related repositories, services, providers, adapters, or tests

## Tasks

### 1. Prove the actual present-state Financial posture
Determine, with file-level evidence:
- whether the Financial module is currently a real operating workspace, a partially actionable workspace, an implemented-but-not-actionable surface, or mostly architectural doctrine
- whether the current route posture is canonical project-scoped, partially canonical, or still transitional
- whether deep-linkable tool surfaces exist
- whether project context is durable and route-safe for Financial use cases
- whether PWA vs SPFx lane ownership is already encoded in implementation or still mostly doctrinal
- whether shared spines are actually wired or only specified in plans

### 2. Identify repo-truth drift
Find statements in the governing documentation that are any of the following:
- stale
- over-claimed
- under-claimed
- ambiguous
- internally contradictory
- mixing current-state truth with target-state intent

Focus especially on drift involving:
- Financial implementation maturity
- route/context readiness
- lane posture
- runtime seam readiness
- tool operational readiness
- acceptance/readiness wording that implies more completion than the repo proves

### 3. Update present-state docs to restore truthfulness
Make only the documentation changes needed to restore repo truth.

Priority order:
1. `current-state-map.md`
2. `04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
3. `phase-3-deliverables/README.md`
4. `P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
5. `P3-G1-Lane-Capability-Matrix.md`
6. `P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md`
7. any Financial doc whose current-state wording is no longer accurate

### 4. Normalize terminology
Where needed, normalize Financial maturity wording using terms like:
- target-state defined
- architecturally defined
- partially implemented
- implemented but not yet operationally complete
- operational in current lane
- acceptance-proven

Do **not** use vague maturity language.

### 5. Preserve doctrine without disguising reality
If a file contains good target-state doctrine, keep it.
But ensure the file clearly distinguishes:
- current-state truth
- planned / target-state doctrine
- blocked or incomplete implementation

## Edit Rules

- Prefer minimal, surgical edits over broad rewrites.
- Do not rewrite entire plan files unless the current structure makes accurate reconciliation impossible.
- Keep naming, taxonomy, and status language aligned with the repo’s existing conventions.
- Do not invent code completeness.
- If code exists but is not truly actionable, say so plainly.
- If doctrine exists without implementation, preserve it as target-state doctrine and label it accurately.

## Required Deliverables

### A. Documentation updates
Apply the repo-truth reconciliation edits directly to the affected files.

### B. Reconciliation summary
Create a concise markdown summary at:
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/_reconciliation/financial-repo-truth-reconciliation-summary.md`

That summary must include:
- files inspected
- files changed
- each corrected repo-truth drift item
- the evidence basis for the correction
- any unresolved contradictions still needing deeper implementation work

### C. Explicit unresolved-items register
At the bottom of the summary, add a section:
- `Remaining Non-Reconciliation Gaps`

This section must list issues discovered but intentionally **not** resolved in this prompt because they require future doctrine or code work rather than repo-truth wording changes.

## Acceptance Criteria

This prompt is complete only when:
- present-state governing docs no longer misrepresent the Financial module posture
- target-state doctrine remains intact where appropriate
- current-state vs target-state is clearly distinguished
- Financial route/context/lane/runtime maturity is described accurately
- no changed statement depends on unsupported assumptions
- a reconciliation summary file is created

## Validation Before Commit

Before finalizing:
1. re-open each changed file
2. verify that the new wording matches actual repo evidence
3. verify that no file now claims stronger implementation maturity than the code proves
4. verify that no target-state doctrine was accidentally downgraded into current-state truth
5. verify that all edits remain aligned with `current-state-map.md`

## Final Response Format

Return:
1. a concise summary of repo-truth drift corrected,
2. the list of files changed,
3. the main unresolved non-reconciliation gaps,
4. and a clear statement of whether the repo now accurately describes the current Financial module posture.

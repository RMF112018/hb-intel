# Prompt 03 — Financial Repo-Truth Reconciliation Validation and Closure

## Objective

Validate that the Financial repo-truth reconciliation work is internally consistent, aligned with actual implementation evidence, and ready to serve as the baseline for subsequent doctrine-completion and implementation prompts.

This prompt should be run **after Prompt 01 and Prompt 02 are complete**.

## Critical Instructions

- This is a validation and closure pass, not a new planning brainstorm.
- Re-check only what is needed to validate the changed files and the maturity model.
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not introduce new aspirational language.
- If a changed document still overclaims maturity, correct it.
- If two reconciled documents still disagree, resolve that disagreement now.

## Validation Scope

Validate alignment across:

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/04_Phase-3_Project-Hub-and-Project-Context-Plan.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/README.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-E2-Module-Source-of-Truth-Action-Boundary-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G1-Lane-Capability-Matrix.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-G2-Cross-Lane-Navigation-and-Handoff-Map.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/P3-H1-Acceptance-Staging-Release-Readiness-Checklist.md`
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/FIN-PR1-Financial-Production-Readiness-Maturity-Model.md`
- the summary files created in the `_reconciliation/` folder
- the implementation files most relevant to the corrected maturity claims

## Tasks

### 1. Perform contradiction check
Look for any remaining contradiction involving:
- present-state Financial posture
- route/context readiness
- lane readiness
- tool operational maturity
- shared-spine maturity
- acceptance / staging / release-readiness posture

### 2. Perform overclaim check
Verify that no reconciled file implies:
- production readiness without evidence
- operational completeness where only architecture exists
- canonical routing where transitional routing still exists
- cross-lane readiness where only one lane is proven
- acceptance proof where only checklist text exists

### 3. Perform underclaim check
Verify that no file now undersells genuine implemented capability.
If actual code proves stronger capability than the reconciled wording, update the docs accordingly.

### 4. Validate the maturity model’s usability
Ensure the new maturity model is usable by future prompts and local agents without reinterpretation.
Specifically verify it can classify:
- the overall Financial module
- Budget Import
- Forecast Summary
- Cash Flow
- Buyout
- Review / Publication / Audit flows
- route/context readiness
- lane readiness
- acceptance readiness

### 5. Produce final closure note
Create a final closure note at:
- `docs/architecture/plans/MASTER/phase-3-deliverables/financial/_reconciliation/financial-repo-truth-reconciliation-closure.md`

That note must include:
- final list of reconciled files
- contradictions resolved in this validation pass
- any remaining non-reconciled items that must be handled by future doctrine/code prompts
- a final statement on whether the repo is now safe to use as the baseline for Financial implementation work

## Acceptance Criteria

This prompt is complete only when:
- the reconciled files no longer materially contradict each other
- the maturity model is internally consistent and usable
- the repo does not overclaim Financial readiness
- remaining gaps are clearly categorized as future doctrine/code work rather than repo-truth drift
- a closure file is created

## Validation Before Commit

Before finalizing:
1. verify that every reconciliation summary file still matches the final edited state
2. verify that no new contradictions were introduced by Prompt 02
3. verify that the final closure note is concise, accurate, and implementation-safe

## Final Response Format

Return:
1. the list of validated files,
2. any final corrections made,
3. the remaining future-work items,
4. and a yes/no answer on whether the Financial repo-truth baseline is now reliable enough for the next implementation prompt set.

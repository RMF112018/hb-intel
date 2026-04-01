# Prompt 5 — Gap 6 Final Closure Audit and Evidence Pack

## Objective

Perform the final repo-truth audit for Gap 6 after Prompts 1–4 and produce an honest closure report with explicit evidence.

## Context

This final step must not assume Gap 6 is closed. It must verify closure against:

1. the latest environment evidence in repo
2. the updated repo-owned code truth
3. the updated documentation truth

## Files to inspect first

All outputs from Prompts 1–4, plus the touched implementation files and tests.

At minimum:
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Projects-list-schema.csv`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/projectViewerGroups-list-schema.csv`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/project-setup-sharepoint-schema-environment-gap-validation.md`
- `docs/architecture/plans/MASTER/spfx/project-setup/estimating/phase-9/gap-6/Gap-6-Closeout-Summary-and-Execution-Plan.md`
- all new docs created in Prompts 1–4
- all updated implementation files
- all updated tests

## Required tasks

1. Conduct a repo-truth closure audit of Gap 6.
   Explicitly verify:
   - the `Projects` contract now matches the intended retained field model
   - removed fields are actually removed from the meaningful contract surface
   - `projectViewerGroups` now has a repo-owned contract / adapter path
   - docs consistently describe the final semantics
   - any remaining environment residuals are explicitly identified

2. Run and capture the most relevant tests for the touched implementation.
   - Include commands run
   - Include whether they passed
   - Be honest about any residual failures

3. Produce the final closure report:
   - `docs/architecture/reviews/project-setup-gap-6-final-closure-report.md`

## Required final report structure

1. Executive summary
2. Original Gap 6 problem statement
3. What changed since the original validation
4. Confirmed current environment evidence
5. Confirmed current repo-owned contract truth
6. Confirmed adapter / usage truth for `projectViewerGroups`
7. Final field-semantics summary
8. Closure assessment:
   - Closed
   - Substantially closed with named residuals
   - Not closed
9. Evidence index
10. Exact remaining actions, if any

## Important rules

- Do not mark Gap 6 closed unless the evidence supports it
- If the repo is now correct but one or more environment actions still remain, say so directly
- If the environment evidence now supports full closure, say so directly and cite it
- Do not hide residuals in narrative prose; list them plainly

## Acceptance criteria

- A final closure report exists in `docs/architecture/reviews/`
- The report clearly states the closure status with evidence
- The report is specific enough to support a production-readiness decision without reopening the whole investigation

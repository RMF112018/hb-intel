# HB Intel — Backend Maintenance Prompt Set + Staging Validation Checklist

This package is intended for the **post-implementation maintenance pass** after Prompts 01–13 have already been executed and pushed.

## Package contents

1. `01_Backend-Maintenance-Master-Prompt.md`
2. `02_Fix-Saga-Orchestrator-Compensation-Test-Failure.md`
3. `03_Fix-Step2-Idempotency-Test-Failure.md`
4. `04_Fix-Step6-Permissions-Test-Failure.md`
5. `05_Backend-Maintenance-Regression-and-Evidence.md`
6. `06_Staging-Validation-Checklist.md`

## Recommended execution order

1. Run the master backend maintenance prompt.
2. Run each focused failing-test prompt in order:
   - compensation failure
   - step 2 idempotency failure
   - step 6 permissions failure
3. Run the regression/evidence prompt.
4. Use the staging validation checklist only after:
   - the backend maintenance pass is complete,
   - failing tests are resolved or intentionally dispositioned,
   - deployment and tenant prerequisites are in place.

## Operating rules for Claude Code

- Follow repo truth first:
  1. `docs/architecture/blueprint/current-state-map.md`
  2. relevant ADRs / locked doctrine
  3. `docs/architecture/plans/MASTER/README.md`
  4. `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
  5. live implementation files and test files
- Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Do not redesign the provisioning architecture.
- Treat this as a **maintenance / hardening pass**, not a feature expansion pass.
- Do not silence tests to make them pass.
- Distinguish clearly between:
  - fixed in code
  - fixed in tests only
  - blocked by tenant / staging prerequisite
  - intentionally deferred

## Required response pattern for every prompt

Claude Code should return using these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

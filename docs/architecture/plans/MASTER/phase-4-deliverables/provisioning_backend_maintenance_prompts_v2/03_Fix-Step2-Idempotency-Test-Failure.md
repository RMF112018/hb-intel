# Prompt 03 — Fix Step 2 Idempotency Test Failure

## Objective

Investigate and resolve the known failing test related to **Step 2 document-library idempotency**.

The goal is to determine whether Step 2 idempotency behavior is currently wrong in implementation, or whether the test expectation no longer matches the real repo-truth logic.

## Required repo-truth reading

- `backend/functions/src/functions/provisioningSaga/steps/step2-document-library.ts`
- `backend/functions/src/config/core-libraries.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `docs/reference/provisioning/saga-steps.md`
- the exact failing Step 2 idempotency test file
- any mock SharePoint service or utility fixtures used by that test

## Execution instructions

1. Inspect the current Step 2 implementation and its idempotency semantics.
2. Confirm how `allSkipped` / existence checks are intended to work across all core libraries.
3. Inspect the failing test’s setup assumptions carefully.
4. Determine whether the failure is caused by:
   - incorrect library existence behavior,
   - stale multi-library expectations,
   - incomplete mock behavior,
   - or incorrect result metadata/assertion expectations.
5. Implement the smallest correct fix.

## Guardrails

- Preserve the multi-library Step 2 design.
- Do not collapse Step 2 back to a single-library legacy assumption.
- Keep idempotency semantics explicit and testable.

## Required deliverables

- Correct root-cause classification of the Step 2 idempotency failure
- Code/test changes needed to resolve it
- Evidence that Step 2 idempotency now behaves as intended

## Acceptance criteria

- The failing Step 2 idempotency test is resolved correctly.
- Step 2 remains idempotent across all intended core libraries.
- The fix does not regress normal library-creation behavior.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Root cause
### Implementation details
### Validation performed
### Remaining risks / follow-ups

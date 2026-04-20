# Prompt 04 — Fix Step 6 Permissions Test Failure

## Objective

Investigate and resolve the known failing test related to **Step 6 permissions**.

This prompt is specifically about the backend test failure, not broad new feature work. The goal is to determine whether the failure reflects:
- an actual defect in Step 6 implementation,
- stale test expectations from the old scaffold condition,
- incorrect mocks for Graph / SharePoint permission assignment,
- or an intentional real-vs-mock operational distinction that the test is misreading.

## Required repo-truth reading

- `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`
- `backend/functions/src/config/entra-group-definitions.ts`
- `docs/reference/provisioning/saga-steps.md`
- the exact failing Step 6 permissions test file
- any shared mock service/test fixtures used by that test

## Execution instructions

1. Inspect the current Step 6 orchestration and the real vs mock service behavior.
2. Inspect the exact failing test setup and assertions.
3. Confirm whether the test is expecting the old scaffold throw path or the current implementation path.
4. Confirm whether the mock services now need to support the updated permission behavior more accurately.
5. Fix the code or the test according to repo truth.
6. Preserve the distinction between:
   - code-complete implementation,
   - and tenant/Graph permission prerequisites that only affect real-mode staging/runtime.

## Guardrails

- Do not blur the difference between real-mode env blockers and mock/test behavior.
- Do not weaken Step 6 semantics to make the test easier.
- Keep the Leaders / Team / Viewers permission path intact.

## Required deliverables

- Correct root-cause classification of the Step 6 test failure
- Code/test/mock changes needed to resolve it
- Evidence that Step 6 test behavior now matches repo truth

## Acceptance criteria

- The failing Step 6 test is resolved correctly.
- Mock/test behavior aligns with the current Step 6 implementation intent.
- The repo still clearly distinguishes staging/tenant prerequisites from local/unit behavior.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Root cause
### Implementation details
### Validation performed
### Remaining risks / follow-ups

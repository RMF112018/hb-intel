# Prompt 02 — Fix Saga-Orchestrator Compensation Test Failure

## Objective

Investigate and resolve the known failing test related to **provisioning saga compensation behavior**.

The goal is to determine whether the current compensation behavior in `saga-orchestrator.ts` is incorrect, whether the test expectation is stale, or whether mocks/test wiring no longer matches repo-truth implementation.

## Required repo-truth reading

- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step1-create-site.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step2-document-library.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step3-template-files.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step4-data-lists.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step7-hub-association.ts`
- the exact failing saga-orchestrator compensation test file
- any shared saga mocks/test fixtures used by that test

## Execution instructions

1. Locate the exact compensation failure and reproduce the reasoning behind it.
2. Inspect the intended compensation order and actual implemented order.
3. Verify whether the current implementation correctly compensates only the steps that should be compensated.
4. Verify whether non-compensated steps are intentionally excluded by design.
5. Fix the implementation or the test depending on verified repo truth.
6. Preserve the current retry / failure / notification / terminal-state behavior unless the failing test proves a real contradiction.

## Guardrails

- Do not broaden compensation beyond repo-truth intent.
- Do not silently remove compensation assertions if the implementation is actually wrong.
- Keep compensation semantics explicit and traceable.

## Required deliverables

- Correct root-cause classification of the compensation failure
- Code/test changes required to resolve it
- Evidence that compensation behavior is now coherent

## Acceptance criteria

- The failing compensation test is resolved correctly.
- Compensation order and scope match repo-truth implementation intent.
- No unrelated saga behavior is broken.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Root cause
### Implementation details
### Validation performed
### Remaining risks / follow-ups
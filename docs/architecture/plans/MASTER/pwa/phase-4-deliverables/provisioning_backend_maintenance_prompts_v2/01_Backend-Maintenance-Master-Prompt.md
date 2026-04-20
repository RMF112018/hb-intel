# Prompt 01 — Backend Maintenance Master Prompt

## Objective

Conduct a focused backend maintenance pass for the Estimating & Accounting SharePoint provisioning workflow after the main implementation sequence has already been completed and pushed.

The specific objective is to:

1. investigate and resolve the **3 known backend test failures** referenced in the implementation summary,
2. confirm whether each failure is:
   - a real code defect,
   - a stale test expectation,
   - an environment/mock-model issue,
   - or a legitimate unresolved implementation gap,
3. implement the smallest correct set of changes to bring the backend into a more trustworthy pre-staging state,
4. preserve repo-truth architecture and current workflow behavior,
5. and produce clear evidence for what is now fixed vs what remains staging-dependent.

## Known focus items

You must specifically investigate the pre-identified failures related to:

- saga-orchestrator compensation
- step 2 idempotency
- step 6 permissions

Do not assume the test is wrong.
Do not assume the implementation is wrong.
Inspect both.

## Required repo-truth reading

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/README.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step2-document-library.ts`
- `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`
- the exact failing test files for these three areas
- any shared test utilities or mocks those tests depend on

## Execution instructions

You are acting as a senior backend maintenance and test-hardening implementation agent working directly in the live HB Intel repo.

Perform the work directly in code.

Before changing anything:
1. locate the exact failing test files and failure output,
2. inspect the live implementation and test assumptions together,
3. classify each failure correctly,
4. fix only what repo truth supports,
5. preserve the architecture and previously completed workflow wiring.

## Guardrails

- Do not redesign the provisioning flow.
- Do not introduce broad new features.
- Do not mask defects by weakening assertions without cause.
- Do not re-read files already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.
- Prefer surgical fixes with strong comments and evidence.
- If a test is stale, update the test to match verified repo truth.
- If the code is wrong, fix the code and preserve surrounding behavior.

## Required deliverables

- Correct classification of all three failures
- Code/test changes needed to address them
- Evidence of validation
- Explicit statement of what still remains tenant/staging-dependent after this pass

## Acceptance criteria

- Each of the three known failing areas is explicitly investigated and dispositioned.
- Any real backend defect found is fixed.
- Any stale test expectation found is corrected with justification.
- No architecture drift is introduced.
- The result strengthens staging readiness rather than creating new ambiguity.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Failure-by-failure disposition
### Implementation details
### Validation performed
### Remaining risks / follow-ups
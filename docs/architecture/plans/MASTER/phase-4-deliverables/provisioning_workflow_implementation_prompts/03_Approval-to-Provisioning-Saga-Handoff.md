# Prompt 03 — Approval to Provisioning Saga Handoff

## Objective

Bind the request lifecycle to the provisioning saga so an approved request automatically starts provisioning from the backend with no manual hidden follow-up step required.

## Required repo-truth reading

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/services/service-factory.ts`
- `backend/functions/src/services/project-requests-repository.ts`

## Execution instructions

You are acting as a senior implementation agent working directly in the live HB Intel repo.

Perform the work directly in code.

Before changing code:
1. inspect the required repo-truth files,
2. inspect the current implementation files named below,
3. identify the exact contract or wiring mismatch,
4. implement the smallest correct set of changes,
5. validate against the affected surfaces and runtime seams.

Do not re-read files that are already in your active context or current memory unless needed to verify a contradiction or retrieve exact evidence.

## Implementation scope

- Inspect the current `advanceRequestState` route and the `provisionProjectSite` route.
- Determine the cleanest repo-truth-compliant way to trigger provisioning when a request becomes `ReadyToProvision`.
- Implement backend-owned handoff logic so the UI does not need to separately call the provisioning endpoint.
- Propagate the correct project metadata, correlation ID, and user identity into the provisioning request.
- Make the handoff idempotent so repeat approval actions do not create duplicate provisioning runs.

## Required deliverables

- Updated backend route/orchestration logic
- Any helper extraction needed for the handoff payload
- Evidence that one approval action starts exactly one provisioning run

## Acceptance criteria

- Approving a request with a valid project number launches provisioning automatically.
- A provisioning status record is created for the approved request.
- The request lifecycle no longer depends on a second manual provisioning trigger.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

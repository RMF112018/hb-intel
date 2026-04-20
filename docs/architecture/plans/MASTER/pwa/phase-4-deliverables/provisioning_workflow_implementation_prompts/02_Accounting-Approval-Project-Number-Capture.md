# Prompt 02 — Accounting Approval Project Number Capture

## Objective

Implement the missing project-number capture and validation flow in the Accounting review surface so approval into `ReadyToProvision` is actually possible against the live backend contract.

## Required repo-truth reading

- `docs/architecture/blueprint/current-state-map.md`
- `apps/accounting/src/pages/ProjectReviewDetailPage.tsx`
- `apps/accounting/src/pages/ProjectReviewQueuePage.tsx`
- `packages/provisioning/src/api-client.ts`
- `backend/functions/src/functions/projectRequests/index.ts`

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

- Inspect the backend validation rules for advancing a request to `ReadyToProvision`.
- Inspect the current Accounting review detail action flow.
- Add required project-number input UX to the approval path.
- Validate project number client-side using the repo-truth format before enabling approval.
- Pass the project number through the shared API client.
- Keep the backend as the source of truth for final validation.

## Required deliverables

- Updated Accounting review detail page
- Any shared utilities needed for project-number validation
- Evidence that approval now submits the required project number

## Acceptance criteria

- A reviewer cannot approve without a valid `##-###-##` project number.
- The backend transition to `ReadyToProvision` succeeds when the number is valid.
- The queue/detail flow remains coherent after approval.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

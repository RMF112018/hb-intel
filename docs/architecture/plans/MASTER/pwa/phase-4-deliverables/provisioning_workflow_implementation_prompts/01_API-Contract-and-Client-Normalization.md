# Prompt 01 — API Contract and Client Normalization

## Objective

Normalize the provisioning/request API contract between frontend consumers and backend function responses so all requester, reviewer, and admin surfaces consume the same correct shapes.

## Required repo-truth reading

- `docs/architecture/blueprint/current-state-map.md`
- `docs/architecture/plans/MASTER/05_Phase-4_Core-Business-Domain-Completion-Plan.md`
- `packages/provisioning/src/api-client.ts`
- `backend/functions/src/utils/response-helpers.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`

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

- Inspect the actual backend response envelope for success and list routes.
- Update `packages/provisioning/src/api-client.ts` so list methods parse `{ items, pagination }` and single-item methods parse `{ data }`.
- Update error parsing to use backend `message` and `code` conventions.
- Inspect direct consumers in Estimating, Accounting, Admin, and PWA and fix any assumptions that remain wrong after the client is normalized.
- Unify base URL usage so provisioning consumers point at the same function-app base path contract.

## Required deliverables

- Code changes implementing the normalized client contract
- Any necessary call-site fixes in affected surfaces
- A concise list of all functions/endpoints touched
- Evidence that requester/reviewer/admin paths now parse responses correctly

## Acceptance criteria

- `submitRequest()` returns the created request object correctly.
- `advanceState()` returns the updated request object correctly.
- `listRequests()` and `listMyRequests()` return request arrays correctly.
- `getProvisioningStatus()` returns a single status object or null correctly.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

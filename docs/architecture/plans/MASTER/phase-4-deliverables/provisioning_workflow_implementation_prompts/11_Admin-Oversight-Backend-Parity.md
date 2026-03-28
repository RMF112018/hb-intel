# Prompt 11 — Admin Oversight Backend Parity

## Objective

Bring the Admin provisioning oversight surface into parity with the backend so every exposed admin action maps to real supported backend behavior. Prefer adding the missing backend support if repo truth shows the UI intent is valid; otherwise trim unsupported UI actions.

## Required repo-truth reading

- `apps/admin/src/pages/ProvisioningOversightPage.tsx`
- `backend/functions/src/index.ts`
- `backend/functions/src/functions/provisioningSaga/index.ts`
- `packages/provisioning/src/api-client.ts`

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

- Inspect every admin action exposed in the oversight UI.
- Inspect the actual backend route registration and provisioning-related function handlers.
- Resolve each mismatch by either implementing the missing backend support or removing unsupported UI paths, based on repo truth.
- Do not leave dead buttons or dead API-client methods in place.

## Required deliverables

- Backend/UI parity for provisioning oversight
- Any route additions or UI trims required
- Evidence that each remaining admin action is real and testable

## Acceptance criteria

- Every admin button maps to a real backend route and behavior.
- No unsupported admin action remains exposed in the UI.
- The shared provisioning API client reflects the real supported admin surface.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

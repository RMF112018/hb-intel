# Prompt 08 — Estimating Surface Stabilization

## Objective

Stabilize the Estimating SPFx requester flow against the corrected backend/runtime contract so the Estimating surface becomes a trustworthy end-to-end requester experience.

## Required repo-truth reading

- `apps/estimating/src/pages/NewRequestPage.tsx`
- `apps/estimating/src/pages/RequestDetailPage.tsx`
- `packages/provisioning/src/api-client.ts`
- `packages/provisioning/src/store.ts`
- `packages/provisioning/src/hooks/useProvisioningSignalR.ts`

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

- Update Estimating surfaces to consume the normalized API client contract.
- Validate clarification-return fetch paths and request detail loading paths.
- Confirm live provisioning progress, failure detail, completion detail, and retry/escalation visibility work coherently after the backend changes.
- Preserve the existing architectural split: headless provisioning package plus surface-owned UI.

## Required deliverables

- Updated Estimating requester pages
- Any minimal supporting component fixes
- Evidence of a coherent requester journey from submit through completion/failure

## Acceptance criteria

- A request can be submitted from Estimating against the corrected contract.
- Detail pages render correct request/provisioning data.
- SignalR/poll fallback behavior still works.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

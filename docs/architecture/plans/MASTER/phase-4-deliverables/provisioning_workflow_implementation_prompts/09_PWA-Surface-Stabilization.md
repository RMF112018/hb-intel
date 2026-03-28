# Prompt 09 — PWA Surface Stabilization

## Objective

Stabilize the PWA requester workflow and elevate it to the intended primary operating path for requesters, consistent with repo-truth platform doctrine.

## Required repo-truth reading

- `docs/architecture/plans/MASTER/00_HB-Intel_Master-Development-Summary-Plan.md`
- `apps/pwa/src/hooks/provisioning/useProvisioningApi.ts`
- `apps/pwa/src/hooks/provisioning/useMyProjectRequests.ts`
- `apps/pwa/src/hooks/provisioning/useProvisioningStatus.ts`
- `apps/pwa/src/routes/project-setup/ProjectSetupPage.tsx`
- `apps/pwa/src/routes/projects/RequestDetailPage.tsx`
- `apps/pwa/src/routes/provisioning/ProvisioningProgressView.tsx`
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

- Update PWA hooks and pages to consume the corrected API/runtime contract.
- Make requester-scoped request listing work cleanly against backend truth.
- Upgrade the progress view from thin status rendering into a stronger requester-facing progress surface using the existing shared store/state.
- Preserve offline/deferred submission behavior where already present.

## Required deliverables

- Updated PWA provisioning hooks/pages
- Any minimal improvements to the requester progress surface
- Evidence that PWA can serve as the primary requester operating path

## Acceptance criteria

- My Requests shows correct requester-scoped data.
- Request detail pages show coherent state, completion, and failure context.
- Provisioning progress is understandable and connected to real status/store data.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

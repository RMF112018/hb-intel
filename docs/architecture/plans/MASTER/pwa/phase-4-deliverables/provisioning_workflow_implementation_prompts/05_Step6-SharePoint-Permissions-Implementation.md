# Prompt 05 — Step 6 SharePoint Permissions Implementation

## Objective

Finish the real Step 6 permissioning implementation so the provisioning workflow assigns Entra-backed access correctly instead of failing at the current scaffold seam.

## Required repo-truth reading

- `docs/architecture/blueprint/current-state-map.md`
- `docs/reference/provisioning/saga-steps.md`
- `backend/functions/src/functions/provisioningSaga/steps/step6-permissions.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/graph-service.ts`
- `backend/functions/src/config/entra-group-definitions.ts`

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

- Inspect the intended Entra group model and SharePoint permission level mapping.
- Replace the scaffold throw in `assignGroupToPermissionLevel()` with the correct real implementation.
- Preserve idempotency and avoid duplicate permission assignment on retries.
- Validate compatibility with the current Step 6 orchestration and stored `status.entraGroups` data.

## Required deliverables

- Real implementation of SharePoint permission assignment
- Any required helper methods or service updates
- Evidence that Step 6 can succeed in real-mode provisioning

## Acceptance criteria

- Step 6 no longer fails because `assignGroupToPermissionLevel()` is scaffolded.
- The expected permission mapping is applied to the target site.
- Retries do not produce duplicate or corrupt permission state.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

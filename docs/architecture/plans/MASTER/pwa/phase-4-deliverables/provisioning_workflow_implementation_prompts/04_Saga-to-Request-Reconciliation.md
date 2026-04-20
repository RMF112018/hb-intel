# Prompt 04 — Saga to Request Reconciliation

## Objective

Implement authoritative reconciliation from provisioning saga lifecycle events back into the project setup request record so requester, reviewer, and admin surfaces all reflect one coherent lifecycle.

## Required repo-truth reading

- `docs/architecture/blueprint/current-state-map.md`
- `backend/functions/src/functions/provisioningSaga/saga-orchestrator.ts`
- `backend/functions/src/functions/timerFullSpec/handler.ts`
- `backend/functions/src/services/project-requests-repository.ts`
- `backend/functions/src/functions/projectRequests/index.ts`
- `packages/provisioning/src/store.ts`

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

- Inspect what fields already exist on the request model and repository mapping.
- Add clean backend reconciliation points for provisioning start, completion, failure, and site URL availability.
- Update the request record when saga execution starts.
- Update the request record on terminal success and terminal failure.
- Handle the timer-driven Step 5 completion path so overnight completion still reconciles correctly.
- Persist `siteUrl` back into the request record if repo truth supports it.

## Required deliverables

- Updated reconciliation logic
- Any repository mapping changes required to persist lifecycle fields
- Evidence that request detail pages can rely on request truth instead of inferred status alone

## Acceptance criteria

- Request state becomes `Provisioning` when provisioning begins.
- Request state becomes `Completed` when provisioning completes.
- Request state becomes `Failed` when provisioning fails terminally.
- Timer-completed runs also reconcile correctly.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

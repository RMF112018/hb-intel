# Prompt 06 — Graph and Tenant Prerequisite Validation

## Objective

Validate and harden the environment/tenant prerequisite path for group creation, membership, app catalog install, hub association, and related provisioning dependencies so the workflow is production-track rather than code-complete-but-ops-blocked.

## Required repo-truth reading

- `backend/functions/README.md`
- `backend/functions/src/services/graph-service.ts`
- `backend/functions/src/services/sharepoint-service.ts`
- `docs/reference/provisioning/saga-steps.md`

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

- Inspect all env-gated prerequisites and identify which are operational blockers versus optional notes.
- Tighten validation and error surfacing where the repo currently leaves ambiguity.
- Make the staging/prod readiness path explicit in code comments and any touched docs.
- If there are missing startup validations for required provisioning settings, add them in the correct backend validation seam.

## Required deliverables

- Code and/or doc updates that make environment prerequisites explicit and enforceable
- A clear list of staging gates validated or still required

## Acceptance criteria

- The backend fails clearly and intentionally when a true prerequisite is missing.
- The codebase no longer implies Step 6 or related operations are production-ready when a required tenant permission is still absent.

## Required response format

Return your result using exactly these headings:

### Summary
### Repo-truth findings
### Files changed
### Implementation details
### Validation performed
### Remaining risks / follow-ups

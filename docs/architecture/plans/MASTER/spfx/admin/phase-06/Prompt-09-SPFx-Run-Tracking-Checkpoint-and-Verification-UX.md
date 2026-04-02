# Prompt-09 — SPFx Run Tracking, Checkpoint, and Verification UX

## Objective

Build the operator-console UX for reviewing install/bootstrap runs, handling checkpoints, and reviewing post-install verification results.

## Important execution rules

- The backend remains the source of truth for run state.
- The UI must make run progress and checkpoint state legible without inventing state client-side.
- Keep install/bootstrap review distinct from generic admin dashboards.

## Inputs

Use:
- current Admin routing/page structure
- shared contracts
- install/bootstrap orchestration APIs
- checkpoint APIs
- post-install verification APIs

## Required work

### A. Install run tracking UX
The Admin app must support:
- run summary/history view
- active run detail view
- step-by-step progress visibility
- terminal outcome review
- evidence/finding visibility to the extent available in the contracts

### B. Checkpoint UX
For checkpointed runs, support:
- clear checkpoint state visibility
- explicit operator instructions
- resume / reject / cancel actions through backend APIs
- operator note/reason capture if supported
- explicit feedback after action submission

### C. Verification-result UX
Support:
- post-install verification launch and/or review
- pass/warn/fail result summary
- categorized verification findings
- linkage back to the relevant install run where appropriate

### D. Navigation fit
Update Admin shell navigation/tool picker only as much as needed so the install/bootstrap lane is coherent and operator-centered.

### E. Documentation output
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-install-run-ux.md`

Explain:
- run list/detail flow
- checkpoint handling UX
- verification-result UX
- route structure
- any intentionally deferred UX niceties

## Required boundaries

- Do not treat `ErrorLogPage` or existing placeholder surfaces as the install-run UX by default.
- Do not hide checkpoint actions inside generic settings sections.
- Do not require page reload gymnastics to understand current run state if the backend already exposes a better status model.

## Validation

Run targeted frontend validation for the touched Admin app surfaces and any related shared UI pieces.
Use the smallest meaningful set and document it.

## Completion condition

Stop after run tracking, checkpoint, and verification UX exists, is documented, and is validated.
Do not perform final doc reconciliation in this prompt.

# Prompt-08 — Admin UX for App-Binding Status and Repair

## Objective

Build the operator-console UX for viewing app-binding status, reviewing drift/verification findings, and initiating reapply/repair actions.

## Important execution rules

- The backend remains the source of truth for binding state, verification state, and repair state.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**
- Keep the UX coherent with the existing Admin operator-console structure and the completed Phase 6 setup lane.

## Inputs

Use:
- the app-binding architecture docs
- the binding store/API from Prompt-04
- the verification/drift/repair support from Prompt-07
- the current Admin routing/page structure
- the Phase 6 setup/run UX patterns where reuse is clearly appropriate

## Required work

### A. Add or update Admin routing/page structure
Expose a coherent operator-facing binding surface that covers at minimum:
- current binding status by target app
- last publication info
- verification/drift findings
- repair/reapply action entry points

Fit the route/page model to repo truth. Reuse an existing lane where appropriate or add the smallest clean extension needed.

### B. Binding-status UX requirements
Show, at minimum:
- target app name/key
- current active binding state
- publication timestamp / actor
- verification state
- drift indicators
- actionable next step

### C. Repair/reapply UX requirements
Support:
- explicit reapply/repair trigger through backend APIs
- clear feedback after action submission
- visibility into result state after repair

### D. Documentation output
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-ux.md`

Explain:
- route/page structure,
- what the UI shows,
- how repair/reapply is initiated,
- what remains intentionally deferred.

## Required boundaries

- Do not store binding truth client-side.
- Do not hide repair actions inside unrelated settings pages unless repo truth makes that the cleanest fit and you document why.
- Do not require operators to inspect raw persistence entities to understand state.

## Validation

Run targeted frontend validation for the touched Admin surfaces.
Add focused component/route tests where appropriate.
Document the exact validation set used.

## Completion condition

Stop after the Admin binding-status/repair UX exists, is documented, and is validated.
Do not perform final reconciliation in this prompt.

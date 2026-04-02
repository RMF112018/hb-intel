# Prompt-11 — Validation, Reconciliation, and Phase 9 Exit

## Objective

Finish Phase 9 by validating the implementation, reconciling contradictions, and producing the canonical exit record for the Broad Entra administration foundation phase.

## Important execution rules

- Do not re-read files still in active context unless needed for final verification.
- Use the smallest meaningful validation set that still gives real confidence.
- This prompt should not introduce new substantive features unless needed to fix a discovered contradiction or broken path.

## Required work

### A. Reconcile the implementation set
Check for contradictions across:
- admin Phase 9 docs
- touched local READMEs
- `apps/admin/**`
- `backend/functions/**`
- any touched reusable admin package files

Resolve:
- inconsistent naming of Entra actions/domains
- mismatched permission/risk labels
- UI claiming unsupported actions
- docs overstating implementation maturity
- backend actions lacking corresponding audit/evidence behavior where the phase requires it

### B. Create the exit report
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-exit-reconciliation.md`

Required sections:
1. What was created or updated
2. Phase 9 exit criteria checklist
3. What Phase 9 intentionally did not do
4. Validation executed
5. Residual risks
6. Recommended next phase entry point

### C. Run the final validation set
Use the smallest meaningful set, likely including:
- targeted backend tests
- targeted frontend tests or route/component checks
- TypeScript/build verification for touched surfaces
- any other directly relevant focused validation

In the exit report, include:
- Verified
- Not run
- Why this set
- Residual risk

## Required exit checklist items

Verify whether the repo now has all of the following:
- a dedicated Entra control lane in Admin SPFx
- broadened user/group administration capability through the privileged backend
- explicit action/risk separation
- explicit permission/role matrix documentation
- audit-backed or evidence-backed identity workflows
- docs/runbooks/env guidance aligned to the implementation

## Completion condition

Stop when the repo has a coherent, validated Phase 9 implementation set and the exit-reconciliation file is complete.

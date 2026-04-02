# Prompt-10 — Docs, Runbooks, Validation, and Final Reconciliation

## Objective

Finish Phase 6 by reconciling the code and docs, updating runbook/operator guidance, and proving the resulting install/bootstrap lane is coherent and architecture-safe.

## Important execution rules

- This is a reconciliation and completion prompt.
- Do not introduce large new capability here unless needed to fix a contradiction or broken gap discovered during final validation.
- Prefer small corrective edits over broad rewrites.

## Inputs

Use all outputs from Prompts 01–09.

## Required work

### A. Create or update Phase 6 docs index
Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/README.md`

It should link and briefly describe all Phase 6 artifacts.

### B. Update local guidance where needed
Update only as needed:
- `apps/admin/README.md`
- `backend/functions/README.md`
- any other directly touched local doc/readme

Clarify:
- setup/install lane purpose
- backend install/bootstrap ownership
- checkpoint semantics
- managed identity / environment posture if touched
- where operator runbooks or phase docs live

### C. Add operator runbook guidance
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-install-operator-runbook.md`

It should explain, in practical operator terms:
- when to run preflight
- how to interpret blockers vs warnings
- when to launch install
- what to do at a checkpoint
- how to review verification results
- when to escalate

### D. Final reconciliation report
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6/admin-spfx-phase-6-final-reconciliation.md`

Required sections:
1. What was created or updated
2. What repo-truth foundations were reused
3. Validation performed
4. Residual limitations
5. Explicit Phase 6 non-goals still deferred
6. Recommended next-phase entry point

### E. Run the smallest credible final validation set
Inspect actual repo scripts and run the narrowest valid set for the touched surfaces.
Typical expectation:
- targeted frontend validation for `apps/admin`
- targeted backend validation for `backend/functions`
- targeted shared-package validation for any touched contract package
- no broad workspace sweep unless the changes truly require it

Document:
- what was run
- what was not run
- why this set was selected
- residual risk

## Required boundaries

- Do not claim production readiness beyond what was actually validated.
- Do not rewrite historical docs beyond what is needed for consistency.
- Do not represent deferred capabilities as complete.

## Completion condition

Stop when:
- the Phase 6 docs are internally consistent,
- operator guidance exists,
- final reconciliation is complete,
- and the code/doc set clearly represents a coherent install/bootstrap lane.

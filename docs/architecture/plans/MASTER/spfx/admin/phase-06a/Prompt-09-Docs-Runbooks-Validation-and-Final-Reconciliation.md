# Prompt-09 — Docs, Runbooks, Validation, and Final Reconciliation

## Objective

Finish the app-binding / backend-setup configuration slice by reconciling the code and docs, updating operator guidance, and proving the resulting implementation is coherent and architecture-safe.

## Important execution rules

- This is a reconciliation and completion prompt.
- Do not introduce large new capability here unless needed to fix a contradiction or broken gap discovered during final validation.
- Prefer small corrective edits over broad rewrites.
- **Do not re-read files that are still within active context or memory unless they changed, the context is stale, or the scope widened.**

## Inputs

Use all outputs from Prompts 01–08.

## Required work

### A. Create or update the slice docs index
Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/README.md`

It should link and briefly describe all app-binding artifacts.

### B. Update local guidance where needed
Update only as needed:
- `apps/admin/README.md`
- `apps/accounting/README.md` if present
- `apps/estimating/README.md` if present
- `backend/functions/README.md`
- any directly touched local docs/readmes

Clarify:
- app-binding purpose,
- backend publication ownership,
- target-app runtime resolution,
- repair/reapply workflow,
- where operator docs live.

### C. Add operator runbook guidance
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-operator-runbook.md`

It should explain, in practical operator terms:
- when bindings are published,
- how to review status,
- what drift means,
- when to reapply/repair,
- what to do when a target app shows missing or stale binding,
- when to escalate.

### D. Final reconciliation report
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-6a-app-binding/admin-spfx-app-binding-final-reconciliation.md`

Required sections:
1. What was created or updated
2. What repo-truth foundations were reused
3. Validation performed
4. Residual limitations
5. Explicit non-goals still deferred
6. Recommended next-phase entry point

### E. Run the smallest credible final validation set
Inspect actual repo scripts and run the narrowest valid set for the touched surfaces.
Typical expectation:
- targeted shared-model validation
- targeted backend validation
- targeted frontend validation for Admin and any touched target apps
- no broad workspace sweep unless the changes truly require it

Document:
- what was run
- what was not run
- why this set was selected
- residual risk

## Required boundaries

- Do not claim production readiness beyond what was actually validated.
- Do not rewrite historical docs beyond what is needed for consistency.
- Do not represent deferred broader config-governance capabilities as complete.

## Completion condition

Stop when:
- the slice docs are internally consistent,
- operator guidance exists,
- final reconciliation is complete,
- and the code/doc set clearly represents a coherent first-class app-binding implementation.

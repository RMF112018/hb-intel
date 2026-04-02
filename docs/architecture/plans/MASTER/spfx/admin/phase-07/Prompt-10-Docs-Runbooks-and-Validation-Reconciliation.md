# Prompt-10 — Docs, Runbooks, and Validation Reconciliation

## Objective

Finish Phase 7 by reconciling the new provisioning hardening work across docs, runbooks, and validation evidence.

## Important execution rules

- Do not re-read files already in current context unless needed for final verification.
- Do not introduce new architecture content unless fixing a contradiction or obvious omission.
- Keep this focused on Phase 7 closure.

## Inputs

Use all outputs from Prompts 01–09.

## Required work

### A. Reconcile documentation
Review and align:
- `docs/architecture/plans/MASTER/spfx/admin/phase-7/**`
- `docs/architecture/plans/MASTER/spfx/admin/admin-spfx-target-architecture.md` if a small cross-link/update is needed
- `apps/admin/README.md`
- `backend/functions/README.md`
- `packages/features/admin/README.md` only if touched/needed
- `packages/provisioning/README.md` if created/updated

Resolve:
- contradictory provisioning-state terminology,
- stale route/UI descriptions,
- overclaims about observability maturity,
- unclear recovery-action semantics,
- and missing references to prerequisite validation or readiness integration.

### B. Create an exit reconciliation file
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-7/admin-spfx-phase-7-exit-reconciliation.md`

Required sections:
1. **What changed**
2. **Phase 7 exit criteria checklist**
3. **What remained intentionally out of scope**
4. **Residual risks**
5. **Recommended next phase entry point**
6. **Validation summary**

### C. Run the smallest credible final validation set
Use the smallest credible validation set that proves:
- provisioning still runs straight through in healthy paths,
- prelaunch failures surface clearly,
- recovery visibility improved,
- route drift was resolved,
- and touched tests pass.

Document:
- what was run,
- what was not run,
- and why.

## Non-goals

- Do not begin Phase 8 SharePoint control implementation.
- Do not begin Phase 9 broad Entra administration.
- Do not start Phase 12 total observability completion work.
- Do not silently leave unresolved route/doc drift.

## Completion condition

Stop when:
- the Phase 7 docs are internally consistent,
- the exit reconciliation file is complete,
- and the repo has a coherent hardened provisioning baseline ready for later phases.

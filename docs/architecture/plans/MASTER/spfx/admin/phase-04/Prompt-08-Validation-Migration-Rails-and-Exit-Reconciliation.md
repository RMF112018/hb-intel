# Prompt-08 — Validation, Migration Rails, and Exit Reconciliation

## Objective

Finish Phase 4 by validating the implementation, documenting migration/cutover behavior, and writing the final exit-reconciliation artifact.

This prompt should close the phase cleanly and explicitly.

## Important execution rules

- Do **not** re-read files already in context unless needed for final verification.
- Use the smallest meaningful validation set based on actual touched scope.
- Do not introduce major new architecture in this prompt unless needed to fix a discovered contradiction or breakage.

## Inputs

Use all outputs from Prompts 01–07.

## Required work

### A. Migration / cutover notes
Document how the repo now handles:
- existing provisioning status history,
- any new generalized run/audit stores,
- compatibility with current provisioning/admin consumers,
- and whether any backfill is intentionally omitted.

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-migration-and-cutover-notes.md`

Be explicit about:
- forward-only assumptions,
- data duplication during transition,
- and any manual ops/deployment considerations.

### B. Final reconciliation artifact
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-exit-reconciliation.md`

Required sections:
1. **What was created or updated**
2. **Phase 4 acceptance-criteria checklist**
3. **Backward-compatibility status**
4. **Residual risks**
5. **Deferred items for later phases**
6. **Recommended next phase entry point**

### C. Validation
Run the smallest credible validation set for the work actually touched.

At minimum, consider:
- `pnpm --filter @hbc/functions check-types`
- `pnpm --filter @hbc/functions test`
- touched shared-package checks/tests
- any focused route/service tests added during this phase

In the exit-reconciliation doc, record:
- **Verified**
- **Not run**
- **Why**
- **Residual risk**

### D. Contradiction sweep
Re-check for contradictions across:
- admin Phase 4 docs
- touched backend docs
- touched shared-package docs
- current-state / reference docs if they were updated
- compatibility statements about provisioning status and audit authority

Fix only what is necessary to remove contradiction or obvious drift.

## Non-goals

- Do not start Phase 5 console buildout.
- Do not expand into new admin domains merely because the generalized spine now exists.
- Do not add speculative roadmap sections beyond concise next-phase entry guidance.

## Completion condition

Stop when:
- validation is complete,
- migration/cutover notes exist,
- exit reconciliation is complete,
- and the repo has a coherent, durable, reviewable Phase 4 history/audit/evidence spine with preserved compatibility.

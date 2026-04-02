# Prompt-10 — Docs, Runbooks, Env Guidance, and README Alignment

## Objective

Bring the documentation set and local guidance up to date with the real Phase 9 implementation.

## Important execution rules

- Do not re-read files still in active context unless needed.
- This is an alignment prompt, not a broad architecture rewrite.
- Update only what is required to eliminate contradiction or major omission.

## Required work

### A. Create or update Phase 9 docs index
Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/README.md`

It should:
- list the Phase 9 documents,
- explain what was implemented,
- cross-link the action catalog, risk taxonomy, permission matrix, and validation/exit docs.

### B. Update admin folder navigation
Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/README.md`

Ensure it now references Phase 9 materials in addition to existing admin docs.

### C. Update local code/docs guidance for touched areas
Update as needed:
- `apps/admin/README.md`
- `packages/features/admin/README.md`
- `backend/functions/README.md`

Keep updates concise and boundary-safe.

### D. Add environment / prerequisite guidance
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-env-and-prerequisites.md`

Document:
- Graph permissions and consent prerequisites
- Entra role assumptions / notes
- config/env flags or secrets required by the implementation
- manual IT approval steps if still necessary
- any constrained or deferred actions due to permission/sensitivity boundaries

### E. Add operator runbook notes
Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-9/admin-spfx-phase-9-operator-runbook.md`

It should explain:
- what the Entra lane can do,
- what it cannot do,
- how risky actions are surfaced,
- and how operators should interpret failures and audit/history results.

## Validation

Before finishing:
- verify every doc path and link resolves,
- ensure local READMEs do not claim unimplemented features,
- ensure permission guidance matches the implemented action set.

## Completion condition

Stop when the documentation set accurately reflects the Phase 9 implementation without contradiction.

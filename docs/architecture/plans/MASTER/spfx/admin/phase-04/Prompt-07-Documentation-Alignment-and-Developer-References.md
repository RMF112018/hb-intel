# Prompt-07 — Documentation Alignment and Developer References

## Objective

Align repo documentation with the new Phase 4 run/audit/evidence spine so future work does not rely on stale or fragmented references.

## Important execution rules

- Do **not** re-read files already in context unless needed.
- This is an alignment prompt, not a full documentation rewrite.
- Preserve useful current docs; update only what is required to remove contradiction, drift, or dangerous omission.

## Inputs

Use:
- all completed Phase 4 artifacts from earlier prompts
- existing admin/backend/provisioning docs already inspected in Prompt-01
- any stale references identified during the audit

## Required work

### A. Admin Phase 4 docs navigation
Create or update:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/README.md`

It must:
- explain what the Phase 4 folder contains,
- link all canonical Phase 4 docs,
- separate baseline docs from implementation notes and exit reconciliation.

### B. Folder-level admin README alignment
Update if needed:
- `docs/architecture/plans/MASTER/spfx/admin/README.md`

Add concise references to the Phase 4 doc family.

### C. Backend / package guidance alignment
Update only as necessary:
- `backend/functions/README.md`
- `apps/admin/README.md`
- `packages/features/admin/README.md`
- any provisioning package or reference doc that materially describes the old persistence/audit model incorrectly

### D. Stale reference cleanup
Fix or replace stale docs identified during the repo-truth audit.
At minimum, address any material provisioning model / audit reference that now misstates:
- run identity,
- status model,
- audit authority,
- or retrieval behavior.

### E. Present-truth map update only if justified
Inspect whether `docs/architecture/blueprint/current-state-map.md` materially omits the now-current generalized Phase 4 persistence reality.

If yes:
- make the smallest present-truth update necessary.

If no:
- do not touch it.

## Constraints

- Do not oversell implementation maturity.
- Do not write target-state speculation into current-state documents.
- Do not let local README files contradict the canonical Phase 4 docs.
- Do not turn this prompt into a large UI or backend refactor.

## Validation

Before finishing:
- verify all new links/paths resolve,
- verify stale references are either corrected or explicitly superseded,
- verify current-state docs remain present truth only.

## Completion condition

Stop when the repo docs no longer materially misdescribe the Phase 4 run/audit/evidence posture.

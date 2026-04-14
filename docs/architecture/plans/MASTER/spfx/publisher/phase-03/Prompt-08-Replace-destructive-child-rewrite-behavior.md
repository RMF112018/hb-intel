# Prompt 08 — Replace destructive child rewrite behavior

## Objective
Remove or materially reduce the data-loss risk from the current delete-all / recreate-all child-list write strategy.

## Critical operating instruction
Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory authority
Treat the following as binding authority for this prompt:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts``

## Primary files to inspect and change
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

## Problem to close
Team and media child writes currently delete all existing rows first and then recreate them. A mid-write failure can leave the article with no children at all.

## Required work
- Replace the current destructive strategy with safer keyed upsert / merge / staged-replacement semantics.
- Preserve stable child identity where possible.
- Do not introduce a new mismatch with tenant-required fields while improving safety.
- Add failure-path coverage proving a partial-write failure cannot silently wipe all rows.

## Required tests
- Add or update the narrowest set of tests needed to prove this prompt is closed.
- Prefer existing test surfaces near the changed implementation.
- Do not rely on unproven manual reasoning where deterministic tests can be added.

## Constraints
- This is a bounded remediation task, not a general redesign.
- Do not make unrelated refactors.
- Do not preserve legacy behavior if it conflicts with tenant-schema truth or workflow correctness.
- Keep naming aligned with `Article Publisher` and the `HB Article*` list family.

## Acceptance criteria
- Child writes are no longer a simple delete-all / recreate-all sequence.
- Mid-write failure risk is materially reduced.
- Tests cover partial failure or interrupted write scenarios.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/08-Closure-Replace-destructive-child-rewrite-behavior.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks

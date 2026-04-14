# Prompt 04 — Realign media seam to tenant schema

## Objective
Bring the `HB Article Media` seam into alignment with the real tenant schema, including the correct internal field names and required fields.

## Critical operating instruction
Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory authority
Treat the following as binding authority for this prompt:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts``
- ``apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx``

## Primary files to inspect and change
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCompositor.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

## Problem to close
The current media seam uses `ImageAssetUrl`, while tenant schema uses `ImageAsset`. It also omits required `Title` and therefore cannot be considered tenant-trustworthy.

## Required work
- Replace the incorrect internal-name usage with the real tenant internal field name.
- Write the required tenant `Title` field.
- Update contracts, mappers, writers, UI panel behavior, preview, and compositor together so they all speak the same tenant-aligned media contract.
- Decide explicitly whether additional tenant media fields such as grouping or feature flags are in scope now; either support them correctly or leave them intentionally unused with accurate comments.
- Scrub nearby comments and assumptions so no stale internal-name alias survives.

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
- Media rows round-trip against the real `HB Article Media` list.
- The gallery path no longer depends on the wrong internal field name.
- Required field `Title` is written correctly.
- Tests prove read/write alignment and gallery consumption alignment.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/04-Closure-Media-seam-to-tenant-schema.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks

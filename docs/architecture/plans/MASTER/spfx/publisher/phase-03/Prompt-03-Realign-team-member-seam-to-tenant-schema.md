# Prompt 03 — Realign team-member seam to tenant schema

## Objective
Bring the full `HB Article Team Members` seam into alignment with the real tenant schema and eliminate non-schema assumptions.

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
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts``
- ``apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx``

## Primary files to inspect and change
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/teamViewerAdapter.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

## Problem to close
The current implementation uses non-tenant fields and wrong field-type assumptions for the team-member child rows. It also omits required tenant field `Title`.

## Required work
- Use the tenant schema report to identify the exact supported `HB Article Team Members` fields and their actual internal names/types.
- Correct `PersonPrincipal` handling for the real SharePoint User field shape rather than treating it as a plain string field contract without proof.
- Write the required tenant `Title` field.
- Remove or relocate unsupported fields that do not exist on the tenant list.
- Update the authoring UI, row mapper, writer, and Team Viewer adapter together so all four layers agree on the same tenant-aligned shape.
- Where information currently depended on removed fields, either derive it from supported data or explicitly remove the unsupported behavior.

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
- Team-member rows can round-trip through the real tenant schema without relying on non-existent fields.
- Required field `Title` is written correctly.
- No reader/writer/adapter/UI layer disagrees on the team-member contract.
- Tests prove tenant-aligned read/write mapping behavior.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/03-Closure-Team-member-seam-to-tenant-schema.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks

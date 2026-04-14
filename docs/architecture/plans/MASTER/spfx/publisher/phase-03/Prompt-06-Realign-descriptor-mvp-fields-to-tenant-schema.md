# Prompt 06 — Realign descriptor mvpFields to tenant schema

## Objective
Rewrite the publisher list descriptor metadata so it reflects real tenant fields and no longer carries obsolete pre-tenant-audit assumptions.

## Critical operating instruction
Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory authority
Treat the following as binding authority for this prompt:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts``

## Primary files to inspect and change
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherListDescriptors.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRowMappers.ts`

## Problem to close
The current `mvpFields` arrays are materially drifted from tenant truth, which can mislead diagnostics, tests, and future developer work.

## Required work
- Rewrite each affected `mvpFields` array strictly from the tenant schema authority.
- Remove obsolete field names that do not exist on the real lists.
- Keep the descriptors useful for future validation and diagnostics rather than aspirational or legacy-looking.
- Add or update drift tests if a relevant test surface exists.

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
- Descriptor metadata no longer lists materially obsolete fields for the audited lists.
- Comments and naming reflect tenant truth.
- Tests or assertions exist to reduce the chance of descriptor drift returning.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/06-Closure-Descriptor-mvp-fields-to-tenant-schema.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks

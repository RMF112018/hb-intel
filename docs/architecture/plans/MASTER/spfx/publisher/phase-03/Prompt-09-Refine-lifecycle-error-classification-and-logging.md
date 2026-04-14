# Prompt 09 — Refine lifecycle error classification and logging

## Objective
Improve the precision of archive/withdraw error logging so lifecycle failures are easier to diagnose operationally.

## Critical operating instruction
Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory authority
Treat the following as binding authority for this prompt:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts``

## Primary files to inspect and change
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherEnums.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`

## Problem to close
Lifecycle helper errors for archive/withdraw are currently classified through coarse publish-mode semantics, which weakens diagnostics.

## Required work
- Improve error classification so archive and withdraw failures are distinguishable and operationally meaningful.
- Stay aligned with the actual tenant error-list schema; do not invent unsupported list fields.
- Where coarse tenant choices force collapse, improve the summary/message content so operators can still tell what failed.
- Keep the implementation bounded; this is a precision improvement, not a redesign of the entire error model.

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
- Archive and withdraw failures are easier to distinguish in the persisted error record and/or message text.
- No new schema drift is introduced.
- Tests prove the improved classification/message behavior.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/09-Closure-Lifecycle-error-classification-and-logging.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks

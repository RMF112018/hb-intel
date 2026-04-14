# Prompt 07 — Reconcile drift policy, preview, and UI messaging

## Objective
Make republish policy, preview drift reporting, validation hints, and user-facing UI copy all agree on what happens when shell or template drift is detected.

## Critical operating instruction
Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory authority
Treat the following as binding authority for this prompt:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- ``apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts``

## Primary files to inspect and change
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/republishPolicy.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/preview/previewBuilder.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`

## Problem to close
The UI currently promises broader regeneration behavior than the policy actually performs, which means the operator explanation is untrustworthy.

## Required work
- Decide the intended behavior for shell-version drift versus template-key drift.
- Make policy, preview output, validation wording, and UI copy all express the same behavior.
- Prefer one clear truth rather than layered caveats.
- Scrub stale comments and tooltips so they do not contradict runtime behavior.

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
- User-facing drift messaging matches actual republish policy.
- Preview and policy produce consistent drift interpretation.
- Tests prove the chosen drift semantics.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/07-Closure-Drift-policy-preview-and-ui-messaging.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks

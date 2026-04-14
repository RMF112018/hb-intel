# Prompt 01 — Close direct published state bypass

## Objective
Remove any generic UI or state-machine path that can mark an article as `published` without running the actual publish lifecycle.

## Critical operating instruction
Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory authority
Treat the following as binding authority for this prompt:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- ``apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts``

## Primary files to inspect and change
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`

## Problem to close
The current authoring surface exposes a direct `→ published` transition. That allows the article control-plane record to enter `WorkflowState='published'` without page creation/update, page publish, or destination-page binding closure.

## Required work
- Remove `published` from the generic manual transition path.
- Make the publish pipeline the only route that can produce `WorkflowState='published'`.
- Review any helper logic, badges, or transition lists that still assume manual promotion to `published` is allowed.
- Preserve legitimate non-publish transitions such as `draft → review`, `review → approved`, `published → archived`, etc., unless a stricter correction is clearly required.
- Scrub the surrounding code so no alternate bypass remains.

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
- There is no user-facing generic transition button or state-machine path that can mark an article `published` without publish orchestration.
- Tests prove the generic transition set no longer exposes `published` as a manual transition.
- No compile/runtime path remains that silently reintroduces the bypass.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/01-Closure-Direct-published-state-bypass.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks

# Prompt 02 — Close publish and republish lifecycle state/history

## Objective
Make successful publish and republish operations fully close the control-plane lifecycle by updating workflow state and workflow history consistently.

## Critical operating instruction
Do not re-read files that are already in your active context or memory unless needed to confirm drift, dependencies, or uncertainty after changes.

## Mandatory authority
Treat the following as binding authority for this prompt:
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/00-Audit-Summary.md`
- `docs/architecture/plans/MASTER/spfx/publisher/phase-02/audit/03-Findings-Register.md`
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts``
- ``apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts``
- ``apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts``

## Primary files to inspect and change
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherWriters.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`

## Problem to close
The current publish/republish flow can create or update a live page and binding while leaving the article in a non-published workflow state and without publish-side workflow-history rows.

## Required work
- On successful first publish, set `HB Articles.WorkflowState='published'` through the orchestrated success path only.
- Reconcile `PublishedDateUtc` semantics so they are consistent and explicit.
- Append a workflow-history row for successful publish.
- Append a workflow-history row for successful republish, with terminology and field usage aligned to the tenant workflow-history schema.
- Ensure article metadata, binding metadata, workflow state, and workflow history remain internally consistent on success and on failure.
- Review the UI status text so it reflects the corrected lifecycle behavior.

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
- A successful publish leaves the article in `published` state and writes a publish history row.
- A successful republish writes a republish history row and does not leave lifecycle/history in an ambiguous state.
- Failure paths do not partially claim publish success when lifecycle closure did not complete.
- Tests prove the corrected success/failure semantics.

## Required output
Create a closure report at:
- `docs/architecture/plans/MASTER/spfx/publisher/phase-03-closure/02-Closure-Publish-and-republish-lifecycle-state-history.md`

The closure report must include:
- objective
- files changed
- exact issue closed
- exact tests added or updated
- proof of behavioral closure
- any remaining follow-up risks

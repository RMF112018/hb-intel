# Closure 01 — Direct `published` state bypass

## Objective
Remove every generic UI or state-machine path that could mark an article
`WorkflowState='published'` without running the publish orchestrator
(page creation, page publish, and destination-binding closure). Make the
publish pipeline the single producer of `WorkflowState='published'`.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.test.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.test.ts`

## Exact issue closed
The workflow state machine previously allowed
`approved → published` and `scheduled → published` as direct manual
transitions. The authoring UI (`ArticlePublisher.tsx → handleTransition`)
routed any `→ target` button through `repositories.articles.upsert`
with `WorkflowState: to` and stamped `PublishedDateUtc` when `to ===
'published'`. Operators could therefore mark an article as published
without ever running the publish orchestrator — no page creation,
no validation, no `HB Article Destination Pages` binding closure.

## Remediation
1. **State machine**: removed `'published'` from the allowed targets
   of `approved` and `scheduled`. `published` is no longer reachable
   from any from-state. The `published → archived | withdrawn`
   terminal fan-out is preserved.
2. **Authoring UI**: dropped the `to === 'published'` branch in
   `handleTransition` that stamped `PublishedDateUtc`. The generic
   transition buttons are rendered from `validTransitionsFrom`, which
   no longer exposes `published` for any from-state, so no button can
   invoke the bypass.
3. **Publish orchestrator**: on a successful publish run (after
   composition + validation + page lifecycle + binding upsert +
   article back-sync), the master `HB Articles` row is now stamped
   with `WorkflowState: 'published'`. A `previous → published`
   history row is appended to `HB Article Workflow History` when the
   state actually changed. The orchestrator is therefore the single
   producer of `WorkflowState='published'`.

## Tests added or updated
- `workflowStateMachine.test.ts`:
  - Replaced the "approved → published" happy-path case with an
    `approved → scheduled` pre-publish case.
  - Added a new assertion that iterates every from-state and proves
    `canTransition(from, 'published') === false` and
    `validTransitionsFrom(from)` never contains `'published'`.
- `publishOrchestrator.test.ts`:
  - Extended the "creates page and binding" test to assert:
    - `articles.upsert` is called with `WorkflowState: 'published'`.
    - `workflowHistory.append` is called exactly once with
      `NewState: 'published'` and `PreviousState: 'approved'`.

## Proof of behavioral closure
- The reduced `TRANSITIONS` map statically rules out every manual path
  to `published`. The machine is pure and fully covered by the new
  exhaustive test.
- The UI only renders transitions derived from `validTransitionsFrom`,
  so the `→ published` button cannot appear.
- The orchestrator now stamps `WorkflowState='published'` inside the
  verified success branch, gated behind composition + validation +
  page publish + binding upsert. Any failure earlier in the pipeline
  returns a typed `{ ok: false, stage }` result and does not touch the
  article's workflow state.

## Remaining follow-up risks
- Callers that construct `PublisherArticleRow` records directly (e.g.
  imports, migration tools) still write `WorkflowState` without going
  through the state machine. That is out of scope here; Prompt 02
  (`publish-and-republish-lifecycle-state-history`) continues to tighten
  the lifecycle and history guarantees.
- If an external process (SPFx admin bypass, PnP import) sets
  `WorkflowState='published'` on `HB Articles`, the UI will accept it
  on next load. Closing that requires list-level governance outside
  this prompt's scope.

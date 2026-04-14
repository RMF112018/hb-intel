# Closure 02 — Publish & republish lifecycle state/history

## Objective
Close the control-plane lifecycle for successful publish and republish so
that article workflow state, workflow history, article metadata, and
binding metadata stay internally consistent. Failures must not leave
the caller claiming publish success when lifecycle closure did not
complete.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.test.ts`

## Exact issue closed
Before this prompt, the orchestrator's success path wrote a page +
binding and back-synced `HB Articles` metadata, but only appended a
`HB Article Workflow History` row when the workflow state actually
changed (`previous → published`, added by Prompt 01). A republish from
an already-published article therefore left no history row, so the
tenant audit trail could not distinguish first-publish from later
republishes and could not capture regenerate events at all.

The `handlePublishAction` status line in the authoring UI also
reported `reason=…` on success without communicating the closed
lifecycle state, which obscured whether the article was actually in
`published`.

## Remediation
1. **Orchestrator — always append workflow history on successful
   publish/republish.** The `decision.action === 'noOp'` branch still
   returns early (no binding write, no history row). Every other
   success branch now appends a `HB Article Workflow History` row:
   - First publish (`workflowStateChanged === true`): `Title` is the
     canonical `previous → published` transition string, `ActionNote`
     names the action (`create` / `regenerate`).
   - Republish from already-published (`workflowStateChanged ===
     false`): `Title` is `republish (<action>)`, `PreviousState` and
     `NewState` are both `published`, and `ActionNote` records
     "Article republished via orchestrator (<action>)".
   - History-append failures are routed through
     `recordPublishingError` with a message that reflects whether
     the op was a publish or a republish, preserving the existing
     best-effort stance (the successful publish is not rolled back).
2. **Orchestrator — `WorkflowState='published'` stamp unchanged.**
   Prompt 01 already made the orchestrator the sole producer. Lines
   that assemble the updated article row are unchanged; the new
   history behavior layers on top.
3. **Authoring UI status text.** `handlePublishAction` now reports
   `state=published` when the orchestrator actually wrote a page +
   binding (i.e., `action !== 'noOp'` and `mode !== 'preview'`).
   `noOp` and `preview` still render the original
   `action=…, reason=…` form because they intentionally do not
   mutate lifecycle state.
4. **Failure-path behavior preserved.** All non-success branches
   (`resolution`, `composition`, `validation`, `policy`, `pagePublish`,
   `bindingWrite`, `articleSync`) return `{ ok: false, stage }`
   before reaching the history append, so a failure cannot silently
   leave a publish-style history row or a published WorkflowState.

## Tests added or updated
- `publishOrchestrator.test.ts`:
  - The existing "creates page and binding" test continues to assert
    the first-publish history row (`previous='approved' →
    new='published'`).
  - **New test**: "republish from already-published state appends a
    republish history row" — seeds an article already in `published`
    with a compatible existing binding, runs `mode: 'republish'`, and
    asserts:
    - `articles.upsert` is called with `WorkflowState: 'published'`
      (no downgrade).
    - `workflowHistory.append` is called exactly once.
    - History row has `NewState='published'`,
      `PreviousState='published'`, `Title='republish (inPlaceUpdate)'`,
      and an `ActionNote` containing "republished".

## Proof of behavioral closure
- Successful first publish: orchestrator writes page, writes binding,
  back-syncs article with `WorkflowState='published'`, appends a
  `previous → published` history row. Covered by existing test.
- Successful republish (same state, page already live): orchestrator
  writes page + binding, keeps `WorkflowState='published'`, appends a
  `republish (<action>)` history row. Covered by the new test.
- Noop republish: returns before binding or history writes, untouched
  by this prompt. Still covered by the existing noOp test.
- Failure stages: each returns a typed `{ ok: false, stage }` before
  reaching the article upsert or history append, so none of the
  lifecycle artefacts are written on failure.
- UI: status text surfaces `state=published` only when the
  orchestrator closed the lifecycle, matching the orchestrator's
  actual behavior.

## Remaining follow-up risks
- `scheduled → published` is no longer a direct manual transition
  (closed in Prompt 01). A future scheduler that needs to flip state
  without running the orchestrator is out of scope; if introduced, it
  must reuse the same history-append contract.
- History append remains best-effort. If Prompt 09
  (`refine-lifecycle-error-classification-and-logging`) upgrades error
  classification, the history-failure path's `stage: 'articleSync'`
  label should be revisited — today it shares the tenant "sync"
  operation bucket, which is acceptable coverage but coarse.
- Scheduled publish-time correctness (the `PublishedDateUtc` stamping
  rule across `create`, `regenerate`, and `inPlaceUpdate`) is
  unchanged and relies on `publishResult.publish.publishedAtUtc`;
  Prompt 05 / 07 may revisit as drift and archive behavior are
  hardened.

# Closure 09 — Lifecycle error classification and logging

## Objective
Make archive and withdraw failures distinguishable from publish
failures (and from each other) in the persisted
`HB Article Publishing Errors` rows, without inventing tenant fields
the schema does not define.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts`

## Exact issue closed
Every lifecycle failure (archive / withdraw) routed through
`recordPublishingError` was tagged with `mode: 'create'` and a
publish-side `stage` value (e.g. `'articleSync'`, `'bindingWrite'`,
`'pagePublish'`). The persisted row's `Operation` collapsed onto the
publish-mode default and the `Title` prefix only carried the
publish-side stage name. An operator scanning the error list could
not tell whether a failure was a publish, a republish, an archive,
or a withdraw — and could not tell which step inside that lifecycle
blew up. The tenant `Operation` Choice is intentionally narrow
(`create / update / publish / sync`); the orchestrator was leaning on
that narrowness instead of carrying the precision in the
operator-readable `Title` and `ErrorSummary`.

## Remediation
1. **Recorder gains a lifecycle channel.** `recordPublishingError`
   now accepts an optional `lifecycleAction: 'archive' | 'withdraw'`
   and a richer `FailureStage` union that includes lifecycle-only
   stages (`articleUpdate`, `pageUnpublish`, `bindingUpdate`,
   `historyAppend`). The persisted `Title` is built as
   `${context}.${stage}: ${article.Title}` where `context` is the
   lifecycle action when present, otherwise the publish mode
   (`create` / `republish` / `preview`). A scan of the tenant error
   list now reads `archive.pageUnpublish: <Title>`,
   `withdraw.bindingUpdate: <Title>`, etc.
2. **`operationFor` extended to lifecycle stages.** The mapping to
   the tenant `Operation` choice is now:
   - `pageUnpublish` (lifecycle): `publish` (it is a page-side
     SavePageAsDraft action).
   - `articleUpdate` / `bindingUpdate` / `historyAppend` (lifecycle):
     `sync` (list-row reconciliation failures).
   - publish-side stages: unchanged behavior.
3. **Lifecycle call sites tagged correctly.** All four
   `recordPublishingError` calls inside `runLifecycleTransition`
   now pass `lifecycleAction: target === 'archived' ? 'archive' :
   'withdraw'` and the precise lifecycle stage instead of squishing
   onto `stage: 'articleSync', mode: 'create'`. The `pageUnpublish`
   call (added in Prompt 05) is also updated to the proper
   lifecycle stage instead of the publish-side `'pagePublish'`
   placeholder.

The fix introduces no new tenant columns; the precision lives in
`Title` and `ErrorSummary` text, which the schema already supports
without change.

## Tests added or updated
- `lifecycleArchiveWithdraw.test.ts` — new
  `describe('lifecycle error classification — persisted error rows
  tag the lifecycle action and stage')` block with four cases that
  inspect the persisted `HB Article Publishing Errors` row:
  - "archive failure at articleUpdate is tagged
    `archive.articleUpdate` with Operation=sync".
  - "archive failure at pageUnpublish is tagged
    `archive.pageUnpublish` with Operation=publish" (also pins the
    `BindingId` propagation and the
    `SavePageAsDraft failed during archived` summary).
  - "withdraw failure at bindingUpdate is tagged
    `withdraw.bindingUpdate` with Operation=sync".
  - "withdraw failure at historyAppend is tagged
    `withdraw.historyAppend` with Operation=sync".

Baseline before this prompt: 16 failed, 163 passed.
After this prompt: 16 failed, 167 passed. Four new
classification tests pass; no regressions on the 16 pre-existing
unrelated failures.

## Proof of behavioral closure
- Every lifecycle `recordPublishingError` call site passes the
  matching `lifecycleAction` and a real lifecycle stage; no
  publish-side stage stand-in remains.
- `operationFor` consults the lifecycle action first, mapping
  `pageUnpublish` → `publish` and every list-row failure → `sync`.
  The mapping is documented in the function's leading comment.
- The persisted Title prefix is asserted by four tests (one per
  lifecycle stage that can fail). An operator scanning the error
  list now sees the lifecycle action + stage at a glance — the
  `Operation` column still abides by the tenant Choice
  enumeration, so no schema drift was introduced.

## Remaining follow-up risks
- The tenant `Operation` Choice still cannot distinguish
  `archive.articleUpdate` from `withdraw.articleUpdate` at the
  column level — both map to `sync`. The Title prefix is the
  primary discriminator. If the tenant expands the Choice
  enumeration to include `archive` / `withdraw`, the orchestrator's
  `operationFor` is the single place to extend.
- `RetryStatus` is set to `'pending'` for every recorded failure.
  Lifecycle failures are typically not retried by the publisher
  itself (operators take corrective action manually), so this is
  consistent with current behavior; a future prompt could
  introduce a `'manual'` status if the tenant Choice grows.
- The error-recorder remains best-effort: a failing
  `publishingErrors.append` is logged and swallowed. That posture
  is unchanged here and is the right default — it must not mask
  the real failure the caller is already handling.

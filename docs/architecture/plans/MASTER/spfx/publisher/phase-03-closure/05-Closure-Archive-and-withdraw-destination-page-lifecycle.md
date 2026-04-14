# Closure 05 — Archive & withdraw destination-page lifecycle

## Objective
Make archive and withdraw reliable visibility-control lifecycle
actions: the live destination page is demoted back to draft on the
tenant (SharePoint `SavePageAsDraft`) so the end-user-visible
version goes away, and the control-plane records
(`HB Articles`, `HB Article Destination Pages`,
`HB Article Workflow History`) stay consistent with the actual page
state.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts`
- Test fixture updates (added `unpublishLive` mock) across:
  `__tests__/publisherEndToEnd.test.ts`,
  `articleSyncBack.test.ts`,
  `pageGeneration/pagePublishLifecycle.test.ts`,
  `publisherPublishingErrors.test.ts`,
  `publishOrchestrator.test.ts`.

## Exact issue closed
Archive and withdraw updated the master article and binding rows
(marking `WorkflowState='archived' | 'withdrawn'`, flipping rollup
flags, and setting the binding to `PublishStatus='draft'`) but
**left the live SharePoint page live**. The destination page record
was still the end-user-visible version, so archive / withdraw were
control-plane-only actions and created a stale-public-visibility
risk: the article was "archived" from the publisher's perspective
but still appeared to users browsing the destination site.

## Remediation
1. **Page creation service — new lifecycle step (`pageCreationService.ts`).**
   Added a typed `unpublishLive({ pageId, siteUrl })` entry to
   `PageCreationService`, backed by a new SharePoint
   implementation that POSTs to
   `_api/sitepages/pages({pageId})/SavePageAsDraft`. This is
   SharePoint's canonical inverse of `publishLive` — it reverts the
   published version of a page back to draft so the live version is
   no longer end-user-visible, while preserving the page record and
   its draft version history for a future republish.
2. **Page shell service (`pageShellService.ts`).** Added
   `unpublishPage({ pageId, siteUrl })` as a thin passthrough so
   the orchestrator depends on the same shell-service abstraction
   it already uses for `publishPage`. The interface now surfaces
   `UnpublishPageInput` / `UnpublishPageOutcome` types aliased
   through the creation-service contract.
3. **Orchestrator (`publishOrchestrator.ts` — `runLifecycleTransition`).**
   After the master `HB Articles` row has been updated, the
   lifecycle now runs `pageShellService.unpublishPage` whenever the
   existing binding carries a `PageId`. On failure, the orchestrator
   returns a typed `{ ok: false, stage: 'pageUnpublish', articleUpdated: true }`
   and records the failure to `HB Article Publishing Errors`; the
   binding and workflow-history writes are skipped so callers do not
   see a partial success that claims the page is no longer live
   when it still is. On success, the binding update marks
   `PublishStatus='draft'` and the `LastSyncMessage` explicitly
   records the `SavePageAsDraft` action so the audit trail reflects
   reality. The success `LifecycleOutcome` now carries
   `pageUnpublished: boolean` — `true` when the page was reverted,
   `false` when the article had no binding / PageId and nothing
   could be unpublished.
4. **Lifecycle stage enum.** `LifecycleOutcome['stage']` now
   includes `'pageUnpublish'`, keeping the failure-stage enum
   exhaustive with the new step.

## Tests added or updated
- `lifecycleArchiveWithdraw.test.ts`:
  - New helper `makeOrchWithUnpublish` that wires a controllable
    `unpublishLive` mock through a real `PageShellService`.
  - **New test**: "reverts the live destination page to draft via
    SavePageAsDraft and reports pageUnpublished=true" — asserts
    `unpublishLive` is invoked with the binding's `PageId` +
    `TargetSiteUrl`, `result.pageUnpublished === true`, and the
    persisted binding's `LastSyncMessage` names the action.
  - **New test**: "skips page-unpublish and reports
    pageUnpublished=false when the article has no binding" —
    proves the no-op path keeps `unpublishLive` untouched and
    still succeeds.
  - **New test**: "fails at pageUnpublish stage when
    SavePageAsDraft fails" — proves the lifecycle halts before
    binding / history writes, records a publishing-error row, and
    returns `stage: 'pageUnpublish'` with `articleUpdated: true`
    so callers see exactly how far the rollout progressed.
- Test fixtures: every `PageCreationService` mock across the
  publisherAdapter suite now provides the `unpublishLive` entry so
  the expanded contract compiles.

Baseline before this prompt: 19 failed, 145 passed.
After this prompt: 19 failed, 148 passed. Three new archive-lifecycle
tests pass; no previously passing test is now failing.

## Proof of behavioral closure
- Successful archive (bound, live page): orchestrator calls
  `SavePageAsDraft` on the SharePoint page, flips the binding to
  `PublishStatus='draft'` with a sync message that records the
  action, appends a `previous → archived` workflow-history row,
  and returns `{ ok: true, pageUnpublished: true }`.
- Successful withdraw: same flow with `target: 'withdrawn'`; the
  binding message records the SavePageAsDraft action and the
  workflow-history row captures the transition. Withdraw-specific
  article behavior (no `ArchiveDateUtc` stamp, rollup flags
  cleared) is unchanged and still covered by the existing
  withdraw-state test.
- Unbound article: orchestrator skips the page-unpublish step,
  returns `{ ok: true, pageUnpublished: false }`, and still writes
  the article-state history row.
- Failed unpublish: orchestrator halts with a typed
  `stage: 'pageUnpublish'` error, writes a publishing-error row,
  and leaves binding + history untouched. No partial-success state
  claims the page is no longer live.

## Remaining follow-up risks
- `SavePageAsDraft` leaves the page record itself intact. If an
  operator wants the destination page *deleted* rather than
  demoted (e.g. for permanent withdrawal), that is a separate
  hosted action — today the control-plane stops at demoting the
  live version to draft. A future prompt can add an explicit
  page-delete action bound to `withdraw` if policy requires full
  removal.
- The orchestrator treats the binding's `TargetSiteUrl` as
  authoritative for the page site; if the binding has neither a
  `TargetSiteUrl` nor an article `TargetSiteUrl` the unpublish
  POST goes to a relative URL and SharePoint will 404. In
  practice both columns are populated by the publish path, but a
  future validation pass could assert that at save time.
- The unpublish request is a fire-and-forget POST from the
  orchestrator's perspective — there is no retry or
  exponential-backoff policy. If transient SharePoint failures
  become common, Prompt 09 (lifecycle error classification) is
  the right place to introduce bounded retries.

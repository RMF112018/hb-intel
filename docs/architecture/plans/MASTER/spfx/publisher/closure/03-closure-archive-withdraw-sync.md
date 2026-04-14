# Closure — Archive / withdraw master ↔ binding sync realignment (Phase-05 Prompt-03)

## Drift closed
`runLifecycleTransition` in `publishOrchestrator.ts` already demoted the `HB Article Destination Pages` binding (`PublishStatus: 'draft'`, `SyncStatus: 'pending'`, `LastSyncDateUtc`, `LastSyncMessage`) and reverted the page to draft via `SavePageAsDraft`. The master `HB Articles` row got `WorkflowState`, `ArchiveDateUtc`, and rollup flags — but its page-sync metadata (`PageSyncStatus` / `LastPageSyncDateUtc`) was left at the pre-lifecycle publish values. Result: after a successful archive / withdraw the master said `PageSyncStatus='in-sync'` while the binding said `SyncStatus='pending'`.

## Fix
`apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- In the lifecycle master-row update, also set `PageSyncStatus: 'pending'` and `LastPageSyncDateUtc: now`. Same `now` the binding's `LastSyncDateUtc` uses, so both rows carry the same timestamp and the same status string.
- `PageId` / `PageName` / `PageUrl` remain untouched — the page record still exists as a draft and is needed for a future republish.

## What did NOT change
- Page-unpublish failure flow: still returns `ok: false, stage: 'pageUnpublish'` with a typed message; unchanged.
- Workflow-history append: unchanged.
- `PageSyncStatus` enum already carries `'pending'` (`publisherEnums.ts`) — no enum / contract / writer changes.
- Actor attribution is out of scope per constraint (Prompt-04).

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts`
- `apps/hb-webparts/config/package-solution.json`
- `docs/architecture/plans/MASTER/spfx/publisher/closure/03-closure-archive-withdraw-sync.md` (this doc)

## Proof
- `lifecycleArchiveWithdraw.test.ts` — the archive happy-path test and the withdraw happy-path test each now assert:
  - `persistedArticle.PageSyncStatus === 'pending'`,
  - `persistedArticle.LastPageSyncDateUtc === NOW`,
  - `persistedArticle.PageSyncStatus === persistedBinding.SyncStatus`,
  - `persistedArticle.LastPageSyncDateUtc === persistedBinding.LastSyncDateUtc`.
- Existing assertions for page-unpublish failure, workflow-history append, and refusal-on-illegal-transition continue to pass unchanged.

## No regression
- `pnpm exec vitest run lifecycleArchiveWithdraw publishOrchestrator` — 29 passing + 2 pre-existing baseline failures (unchanged).
- `pnpm exec tsc --noEmit` — clean.

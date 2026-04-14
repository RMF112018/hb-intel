# Closure — Archive, Withdraw, and Manual Transition Atomicity/Recoverability (Phase-06 Prompt-02)

## Objective closed
Close lifecycle drift risks where transition flows could leave article state, page visibility, binding state, and workflow history out of sync after partial failure.

## Design chosen
Because SharePoint cannot provide a single cross-list/page transaction, the closure model is:
- **Durability-first ordering** for archive/withdraw:
  1. `SavePageAsDraft` (if bound page exists)
  2. binding update (`PublishStatus='draft'`, `SyncStatus='pending'`)
  3. workflow history append
  4. final article state upsert (`archived`/`withdrawn`)
- **Explicit partial-state surfacing**:
  - lifecycle outcomes now carry `pageUnpublished`, `bindingUpdated`, `historyAppended`, `articleUpdated`.
- **Generic manual transition compensation**:
  - article upsert then history append;
  - if history append fails, orchestrator attempts article rollback to previous state;
  - outcome returns rollback result (`attempted/succeeded/message`) so operators can see final consistency state.

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
  - Reordered `runLifecycleTransition` to stamp article state last.
  - Extended lifecycle outcome metadata for explicit recoverability.
  - Added `transitionManual` orchestrator path with history-failure rollback.
  - Extended lifecycle-action classification for publishing-error rows with `manualTransition`.
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - `handleTransition` now delegates non-archive/withdraw transitions to `orchestrator.transitionManual` instead of doing inline article+history writes.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts`
  - Updated lifecycle tests for reordered closure sequence and partial-state flags.
  - Added manual-transition tests covering success, rollback success, and rollback failure.

## Before/after sequence
Before:
1. Archive/withdraw stamped article state early.
2. Unpublish/binding/history happened after article update.
3. Generic manual transition did article upsert before history append with no rollback on history failure.

After:
1. Archive/withdraw close page visibility and binding first, append history, then stamp article state last.
2. Any failure returns explicit partial-progress flags.
3. Generic manual transitions rollback article state when history closure fails.

## Test evidence mapping
1. Archive success coherent across article/page/binding/history:
   - `lifecycleArchiveWithdraw.test.ts` archive success test.
2. Withdraw success coherent across article/page/binding/history:
   - `lifecycleArchiveWithdraw.test.ts` withdraw success test.
3. Page-unpublish failure not ambiguous:
   - archive page-unpublish failure test asserts no article state advance and no binding/history writes.
4. Binding-update failure recoverable/logged:
   - archive binding-update failure test asserts partial flags + publishing-error row.
5. History-append failure per chosen design:
   - withdraw history-append failure test asserts no article state advance + explicit partial flags.
6. Generic manual transitions require auditable closure:
   - manual transition tests assert rollback success and rollback-failure surfacing when history append fails.

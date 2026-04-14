# Closure — Publish-path transactionality and orphan-page risk (Phase-06 Prompt-01)

## Objective closed
Close the publish/republish seam where the destination page could already be live while downstream control-plane closure failed (`HB Article Destination Pages` binding write, `HB Articles` back-sync, or `HB Article Workflow History` append).

## Design chosen
Compensating closure with `SavePageAsDraft`:
- After `publishPage` succeeds, any downstream failure in `bindingWrite`, `articleSync`, or `historyAppend` now triggers an immediate compensating `unpublishPage` call.
- Failure result preserves the real failing stage (`bindingWrite`, `articleSync`, `historyAppend`) and includes explicit rollback metadata:
  - `attempted`
  - `succeeded`
  - `message`
- If compensating unpublish fails, a second `HB Article Publishing Errors` row is appended at `stage=pageUnpublish` without masking the primary failure.
- `historyAppend` is now required for success (no longer best-effort success with silent drift risk).

## Files changed
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
  - Added `PublishRollbackResult` and failure-shape `rollback`.
  - Added compensating unpublish helper for post-publish failures.
  - Wired compensation into `bindingWrite`, `articleSync`, and `historyAppend` failure paths.
  - Made `historyAppend` failure return `ok: false` instead of succeeding.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.test.ts`
  - Updated history-append failure proof to assert blocking failure + rollback.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/articleSyncBack.test.ts`
  - Added rollback assertions for `bindingWrite` and `articleSync` failures.
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherPublishingErrors.test.ts`
  - Added rollback assertions for `bindingWrite` failures.
  - Added explicit proof that failed compensating unpublish creates `create.pageUnpublish` error row while preserving the primary `create.bindingWrite` row.

## Before/after sequence
Before:
1. Compose + publish page live.
2. Attempt binding write, article back-sync, history append.
3. If a downstream step failed, return failure (or in history case, still return success) while page could remain live.

After:
1. Compose + publish page live.
2. Attempt binding write, article back-sync, history append.
3. On any downstream failure, immediately attempt `SavePageAsDraft` on the published page.
4. Return failure at the true failing stage with rollback outcome attached.
5. If rollback also fails, append a `pageUnpublish` publishing-error row in addition to the primary error row.

## Test evidence mapping
1. Successful publish still works for `create`, `inPlaceUpdate`, `regenerate`.
- `publishOrchestrator.test.ts` existing green-path tests for create/inPlaceUpdate/regenerate remain.

2. Simulated binding-write failure does not leave untracked live page.
- `articleSyncBack.test.ts`: bindingWrite failure now asserts rollback metadata and `unpublishLive` invocation.
- `publisherPublishingErrors.test.ts`: bindingWrite failure asserts rollback success and tenant error-row persistence.

3. Simulated article-sync failure does not leave ambiguous control-plane state.
- `articleSyncBack.test.ts`: articleSync failure now asserts rollback metadata and `unpublishLive` invocation.

4. Simulated history-append failure handled by chosen closure design.
- `publishOrchestrator.test.ts`: history append failure now returns `ok:false`, `stage:'historyAppend'`, and rollback success metadata.

5. Error logging still works and does not mask real failure.
- `publishOrchestrator.test.ts`: primary error row remains `create.historyAppend`.
- `publisherPublishingErrors.test.ts`: on compensating failure, test proves two rows:
  - primary `create.bindingWrite`
  - secondary `create.pageUnpublish` with `Operation=publish`.

# Phase 10 · Prompt 02 closure — Late-publish split-state consistency

## Chosen consistency model: fail-truthful demotion with full reconciliation
When the page has already been published but a later closure step (`articleSync` or `historyAppend`) fails, the orchestrator:

1. Demotes the SharePoint page via `SavePageAsDraft` (existing behavior).
2. If demotion succeeded, reconciles the remaining truth surfaces so they match the now-draft page:
   - **Binding row** is upserted with `PublishStatus='error'`, `SyncStatus='error'`, `LastSyncDateUtc=now`. It no longer claims a live healthy destination page.
   - **Master article** — only when the master was already mutated (i.e. `historyAppend` failure) — is upserted with `WorkflowState=<previousWorkflowState>`, `PageSyncStatus='error'`, `LastPageSyncDateUtc=now`, `UpdatedDateUtc=now`. Page identity fields (PageId/PageUrl/PageName/…) stay as written so there is a truthful trail of what was attempted; the status fields make clear closure did not succeed.
   - **Workflow history** is never fabricated; closure did not occur.
3. Each reconciliation write is best-effort: a failing reconcile emits its own `HB Article Publishing Errors` row tagged `bindingUpdate` or `articleUpdate` so operators see the full persistence trail without masking the primary failure.
4. If the page demotion itself failed (rollback did not succeed), the system cannot make the four surfaces consistent by demotion — the page is still live, and the binding/master stay in their just-written "published" shape (truthful to the page). The existing `pageUnpublish` error row captures that the compensation failed.

## State matrix

| Shape                 | Stage          | Page      | Binding                                   | Master                                                               | History |
|-----------------------|----------------|-----------|-------------------------------------------|----------------------------------------------------------------------|---------|
| create                | articleSync    | draft     | PublishStatus=error / SyncStatus=error    | unchanged (still at previous WorkflowState, no page identity)        | none    |
| create                | historyAppend  | draft     | PublishStatus=error / SyncStatus=error    | WorkflowState reverted to previous; PageSyncStatus=error             | none    |
| in-place republish    | articleSync    | draft     | PublishStatus=error / SyncStatus=error    | unchanged                                                            | none    |
| in-place republish    | historyAppend  | draft     | PublishStatus=error / SyncStatus=error    | WorkflowState=published (previous); PageSyncStatus=error             | none    |
| regenerate            | articleSync    | draft     | PublishStatus=error / SyncStatus=error    | unchanged (still bound to prior PageId in master)                    | none    |
| regenerate            | historyAppend  | draft     | PublishStatus=error / SyncStatus=error    | WorkflowState=published (previous); PageSyncStatus=error; new page identity kept as attempted | none    |

## Changed files
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts` — added `reconcileLateFailureTruth` helper; wired into `articleSync` and `historyAppend` branches after successful rollback.
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts` — added late-publish reconciliation describe block (4 tests).
- `apps/hb-publisher/config/package-solution.json` — version bump to 1.0.0.9.

## Tests added
Added describe block `late-publish fail-truthful reconciliation (phase-10 prompt-02)`:
- `create + articleSync failure`: asserts page demoted, binding reconciled (PublishStatus=error / SyncStatus=error), master never stamped published (only the throwing first call), no history row, error summary contains the reconcile note.
- `create + historyAppend failure`: asserts page demoted, binding reconciled, master upserted twice (first `WorkflowState='published'`, second reverts to `'approved'` with `PageSyncStatus='error'`), error summary contains the master-revert note.
- `in-place republish + historyAppend failure`: master reconciled keeps `WorkflowState='published'` (previous state) but flips `PageSyncStatus='error'`; binding reconciled retains the existing BindingId.
- `regenerate + articleSync failure`: binding reconciled (PublishStatus=error / SyncStatus=error).

Existing `create + historyAppend` classification test and all prior publish/republish/noOp/preview tests remain green. Targeted suite: 35/35 pass.

## Before / after state examples

### Example 1 — create + articleSync failure
**Before this change**
- Page: draft (demoted)
- Binding: PublishStatus='published', SyncStatus='in-sync' ← contradicts page
- Master: unchanged (approved, no page identity)
- History: none
- Error row: `articleSync`

**After this change**
- Page: draft
- Binding: PublishStatus='error', SyncStatus='error', LastSyncDateUtc=now ← matches page
- Master: unchanged (approved, no page identity)
- History: none
- Error row: `create.articleSync` with summary containing rollback + reconcile notes

### Example 2 — in-place republish + historyAppend failure
**Before this change**
- Page: draft (demoted)
- Binding: PublishStatus='published', SyncStatus='in-sync' ← contradicts page
- Master: WorkflowState='published', PageSyncStatus='in-sync', LastPageSyncDateUtc=now ← falsely advertises closure
- History: none
- Error row: `historyAppend`

**After this change**
- Page: draft
- Binding: PublishStatus='error', SyncStatus='error'
- Master: WorkflowState='published' (unchanged from previous), PageSyncStatus='error', LastPageSyncDateUtc=now ← master no longer advertises healthy closure
- History: none
- Error row: `republish.historyAppend` with summary containing rollback + binding-reconcile + master-revert notes

## Verification
- `npx vitest run src/data/publisherAdapter/publishOrchestrator.test.ts` → 35/35 pass.
- `npx tsc --noEmit` in `apps/hb-publisher` → clean.

## Non-goals (intentional)
- No changes to preview semantics.
- No changes to validation, republish approval, or milestone-legacy policy gates.
- No changes to archive/withdraw lifecycle.
- No fabrication of workflow-history rows for failed closures.

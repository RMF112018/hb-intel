# Phase 10 · Prompt 03 closure — Archive / withdraw fail-truthful non-live lifecycle

## Chosen lifecycle failure model
Once the destination page has been demoted via `SavePageAsDraft`, all persisted surfaces converge around a **non-live** state. We never restore the master article to a live/published shape simply because a later step (binding update, master update, or workflow history append) failed — that reintroduces false-live split state. A history-append failure is treated as an audit/logging failure on top of an already-truthful non-live state, not as grounds to fabricate a published master row.

Concretely:
- Binding-lookup failure: fail closed before any demotion. No surfaces mutated.
- Page-unpublish failure: nothing downstream runs. Page still live → binding and master stay at previous state. Operator is paged via the `pageUnpublish` error row.
- Binding-update failure (after demotion): page is draft; binding update failed. Still reconcile the master to the lifecycle target with `PageSyncStatus='error'` so master matches the demoted page. No history row.
- Article-update failure (after demotion + binding update): page is draft; binding is draft/pending; master update failed. Surface `articleUpdated=false`; no history. No retry loop.
- History-append failure (after demotion + binding + master): all three surfaces stay at their truthful non-live values. No master revert. `historyAppended=false`. Error row tagged `historyAppend`.

## Step ordering
Preserved the existing order: binding lookup → page unpublish → binding update → master update → history append. The only ordering-relevant change is removing the historyAppend → master revert step: the revert is strictly harmful under the fail-truthful model.

## Archive matrix

| Stage failure       | Page   | Binding                              | Master                                       | History | Operator signal                        |
|---------------------|--------|--------------------------------------|----------------------------------------------|---------|----------------------------------------|
| bindingLookup       | live   | untouched                            | untouched                                    | none    | `archive.bindingLookup` error          |
| pageUnpublish       | live   | untouched                            | untouched                                    | none    | `archive.pageUnpublish` error          |
| bindingUpdate       | draft  | unchanged (stale — flagged)          | WorkflowState=archived; PageSyncStatus=error | none    | `archive.bindingUpdate` + optional articleUpdate error |
| articleUpdate       | draft  | draft/pending                        | unchanged (still previous state)             | none    | `archive.articleUpdate` error          |
| historyAppend       | draft  | draft/pending                        | WorkflowState=archived (kept); rollups off   | none    | `archive.historyAppend` error          |

## Withdraw matrix
Same shape as archive with `WorkflowState='withdrawn'` instead of `'archived'` and no `ArchiveDateUtc` / `IncludeInArchive` change.

| Stage failure       | Page   | Binding                              | Master                                        | History | Operator signal                         |
|---------------------|--------|--------------------------------------|-----------------------------------------------|---------|-----------------------------------------|
| bindingLookup       | live   | untouched                            | untouched                                     | none    | `withdraw.bindingLookup` error          |
| pageUnpublish       | live   | untouched                            | untouched                                     | none    | `withdraw.pageUnpublish` error          |
| bindingUpdate       | draft  | unchanged (stale — flagged)          | WorkflowState=withdrawn; PageSyncStatus=error | none    | `withdraw.bindingUpdate` + optional articleUpdate error |
| articleUpdate       | draft  | draft/pending                        | unchanged                                     | none    | `withdraw.articleUpdate` error          |
| historyAppend       | draft  | draft/pending                        | WorkflowState=withdrawn (kept)                | none    | `withdraw.historyAppend` error          |

## Reasoning for the historyAppend change
Previously, a history-append failure in `runLifecycleTransition` compensated by reverting the master back to `previousState` (e.g. `published`). Because the page was already demoted and the binding was already flipped to draft/pending, that revert left the master advertising a live/published article while the public page was non-live — the exact contradiction this prompt targets. The revert has been removed. `transitionManual` (non-page manual state transitions) intentionally keeps its own rollback behavior because there is no page/binding surface to contradict.

## Reasoning for the bindingUpdate change
Previously, a bindingUpdate failure returned immediately, leaving the master at `previousState='published'` while the page was already demoted and the binding was stale. Now we upsert the master to the lifecycle target with `PageSyncStatus='error'` so at least master + page agree that the content is no longer live. The stale binding is surfaced as an operator-actionable `bindingUpdate` error row.

## Changed files
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts` — removed master-revert compensation from the lifecycle `historyAppend` branch; added master-reconcile-to-target in the lifecycle `bindingUpdate` branch.
- `apps/hb-publisher/src/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts` — replaced the old "rolls master back" historyAppend tests with a fail-truthful assertion; replaced the old bindingUpdate assertion with the master-reconcile assertion; added a `phase-10 prompt-03` matrix describe block covering archive historyAppend, withdraw pageUnpublish, withdraw bindingUpdate, withdraw articleUpdate.
- `apps/hb-publisher/config/package-solution.json` — bumped to 1.0.0.10.

## Tests added / updated
Updated:
- `orchestrator.archive › returns bindingUpdate failure …` → now asserts `articleUpdated=true` and that the master was reconciled to `archived` with `PageSyncStatus='error'`.
- `orchestrator.withdraw › returns historyAppend failure …` → now asserts no master revert, `articleUpdated=true`, master stays at `withdrawn`, `rollback` field absent.
- Deleted the obsolete "rollback failure" historyAppend test (rollback no longer exists in this path; `transitionManual` has its own rollback tests, retained).

Added (`lifecycle fail-truthful non-live matrix (phase-10 prompt-03)`):
- archive + historyAppend failure
- withdraw + pageUnpublish failure
- withdraw + bindingUpdate failure (master reconcile)
- withdraw + articleUpdate failure

## Explicit note on history-append failure
A failed `HB Article Workflow History` append after a successful lifecycle demotion is now treated as an **audit/logging failure on top of a truthful non-live lifecycle state**. The page remains draft, the binding remains draft/pending, and the master remains at the lifecycle target (`archived` or `withdrawn`). No history row is fabricated, no master revert is attempted. The operator sees a `*.historyAppend` publishing-error row whose `ErrorSummary` states explicitly that page/binding/master are at their non-live values and the history row was not written — this is observable remediation information without reintroducing false-live master state.

## Verification
- `npx vitest run src/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts src/data/publisherAdapter/publishOrchestrator.test.ts src/data/publisherAdapter/publishResolutionContext.test.ts` → 66/66 pass.
- `npx tsc --noEmit` in `apps/hb-publisher` → clean.

## Non-goals (intentional)
- No change to `transitionManual` (non-page) rollback behavior.
- No change to preview, publish, republish policy or gating.
- No change to binding-lookup fail-closed semantics.

# Closure — Archive/withdraw atomic and compensating

**Phase:** `docs/architecture/plans/MASTER/spfx/publisher/phase-09`
**Prompt:** `Prompt-04-Make-archive-withdraw-atomic-and-compensating.md`
**Status:** Closed

## Defect

`runLifecycleTransition` wrote side effects in the order:

```
1. pageUnpublish  (SavePageAsDraft)
2. bindingUpdate  (binding row PublishStatus='draft')
3. historyAppend  (workflow-history row "previous → target")
4. articleUpdate  (master HB Articles row WorkflowState=target)
```

A failure at step 4 left a durable workflow-history row claiming the article had transitioned, while the master article row was still in `previousState`. That is a false-forward audit trail — the system told operators "archived" while the article was still operationally in its prior state.

## Resolution

Reorder so master closure precedes the durable audit, and compensate the only remaining split-state window.

### New ordering

```
1. pageUnpublish         (SavePageAsDraft; fail-closed)
2. bindingUpdate         (binding row PublishStatus='draft')
3. articleUpdate         (master HB Articles WorkflowState=target)  ← moved up
4. historyAppend         (workflow-history "previous → target")    ← moved down
   └─ on failure, compensate by reverting master to previousState
      and surface { attempted, succeeded, message } on the outcome.
```

### Step table — old vs new behavior

| Failure point   | Old result                                                                 | New result                                                                                          |
|-----------------|----------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| pageUnpublish   | `stage: 'pageUnpublish'`; no writes                                        | unchanged                                                                                           |
| bindingUpdate   | `stage: 'bindingUpdate'`; page already demoted                             | unchanged                                                                                           |
| articleUpdate   | `stage: 'articleUpdate'`, **history already written** (false-forward)      | `stage: 'articleUpdate'`, history NOT written — no false-forward audit                              |
| historyAppend   | `stage: 'historyAppend'`, article still in `previousState` (no compensation needed) | master stamped first; on failure, **compensate** by reverting master to `previousState`; `rollback: { attempted, succeeded, message }` surfaces the outcome |

### Compensation semantics

On history-append failure after a successful master stamp:

- `articles.upsert(originalArticleRow)` is invoked to revert the master back to `previousState`.
- If the revert succeeds: `rollback = { attempted: true, succeeded: true, message: "Master article reverted to '<previousState>'." }`, `articleUpdated: false` (the final committed state is the pre-transition one).
- If the revert fails: `rollback = { attempted: true, succeeded: false, message: "Master rollback to '<previousState>' failed: …" }`, `articleUpdated: true` (the master is split and the caller is told so explicitly; operators must reconcile manually).

The rollback outcome is concatenated into the failure `message` so a single line of operator-facing text reports both the primary failure and the compensation result.

## Files changed

- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
  - Reordered `runLifecycleTransition` to: pageUnpublish → bindingUpdate → articleUpdate → historyAppend.
  - Added compensating master rollback on history-append failure with explicit `rollback` field on the returned failure.
  - Extended `LifecycleOutcome` failure shape with an optional `rollback: { attempted, succeeded, message }` field.
- `apps/hb-publisher/src/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts`
  - Updated the articleUpdate-fail test to assert the new ordering (`historyAppended: false`, `f.historyAppend` not called).
  - Replaced the historyAppend-fail test with two tests: compensation-succeeds (rollback attempted + succeeded + forward/revert writes), and compensation-fails (rollback attempted + not succeeded, split state explicitly surfaced).
- `apps/hb-publisher/config/package-solution.json` — version bump `1.0.0.4 → 1.0.0.5`.

## Validation

- `pnpm --filter @hbc/spfx-hb-publisher check-types` — clean.
- `pnpm --filter @hbc/spfx-hb-publisher test` — 493 passed (+1 net new), 6 pre-existing `publisherEndToEnd.test.ts` failures unchanged (unrelated).

New/updated proof points:

1. articleUpdate failure cannot leave a misleading success-shaped history trail — asserted by `f.historyAppend` not being called and `historyAppended: false`.
2. article/binding/page outcomes are explicitly compensated or consistent — asserted by the two history-append tests showing rollback-succeeds and rollback-fails paths with distinct outcome shapes.
3. failure results clearly state whether rollback was attempted and whether it succeeded — asserted via `result.rollback.{attempted, succeeded, message}`.
4. publish/republish path behavior unchanged — the publish/republish code path was not edited; Prompt-02 and Prompt-03 suites still pass.

## Scope held tight

- No changes to page-unpublish, binding-update, or publishing-error classification.
- No changes to `decideRepublishAction`, republish approval gate (Prompt-02), or the fail-closed binding lookup (Prompt-03).
- No changes to `transitionManual` (already had equivalent compensation).

## Remaining assumptions

- The original `article` row captured before the forward upsert is a faithful pre-image suitable for rollback. The orchestrator already loads it at the top of `runLifecycleTransition`, and the forward upsert spreads over that row — so reverting by upserting the original row is lossless with respect to the transition fields we change.
- Rollback writes are best-effort; a failed rollback is surfaced explicitly (not silently retried) because a persistent write failure typically needs operator attention rather than additional automated attempts.

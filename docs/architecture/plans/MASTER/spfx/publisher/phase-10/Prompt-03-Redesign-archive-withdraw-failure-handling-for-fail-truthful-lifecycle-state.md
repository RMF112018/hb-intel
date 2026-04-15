# Prompt 03 · Redesign archive/withdraw failure handling for fail-truthful lifecycle state

## Objective
Make archive and withdraw converge to an internally truthful **non-live** lifecycle state even when a late failure occurs after page demotion has already started. The goal is not only to “handle errors.” The goal is to eliminate contradictory lifecycle truth across:
- the destination page
- `HB Article Destination Pages`
- `HB Articles`
- `HB Article Workflow History`

## Critical operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required repo anchors
Read and use these as binding implementation anchors:
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-publisher/src/data/publisherAdapter/lifecycleArchiveWithdraw.test.ts`
- any page-demotion helper or repository seam touched by `runLifecycleTransition(...)`

## Current issue in repo-truth terms
The lifecycle path is better than it used to be:
- binding lookup now fails closed
- page demotion is explicit
- some late failures already attempt compensation
- error classification is more precise

But the current implementation is still not fully truthful in every late-failure branch.

### Still-open split-state windows
After `pageUnpublish` succeeds, the following branches can still leave contradiction:

1. **`bindingUpdate` failure**  
   The page is already demoted, but the binding row may still claim a live or previously synchronized state.

2. **`articleUpdate` failure**  
   The page is already demoted and the binding may or may not already be updated, but the master article can remain stale.

3. **`historyAppend` failure**  
   This is the biggest repo-truth shift relative to the old package.  
   Current code can revert only the master row back to the previous workflow state while leaving:
   - the page demoted
   - the binding demoted/pending

That means the master row can say “published” again while the public page is no longer live and the binding says otherwise.

That is not acceptable closure.

## Required design task
You must define and implement one explicit lifecycle failure model for:
- `archive`
- `withdraw`

The model must cover late failures after page demotion begins and must preserve the safety rule that the system must not silently keep a page public when lifecycle demotion should have happened.

## Strong recommendation
Prefer a **fail-truthful non-live model** once page demotion succeeds.

In practical terms:
- once the public page has been demoted successfully, do not restore only the master row to a live state unless you can also restore the page and binding to the same live truth
- if a late failure prevents full lifecycle closure, the persisted records should still converge around the fact that the page is no longer live
- history failure should be handled as an audit/logging failure on top of a non-live lifecycle state, not as a reason to fabricate a published master row again

If you choose a different model, it must be safer and more internally consistent than that.

## Intended future state
After this prompt is complete, archive and withdraw must each have a defined, tested outcome for:
- binding lookup failure
- page unpublish failure
- binding update failure
- article update failure
- history append failure

The exact write ordering may change if repo truth supports a better model, but the final state must always answer these questions consistently:
- Is the page still live?
- Does the binding row match that page state?
- Does the master article match that page/binding state?
- Was workflow history actually appended or not?
- Does the error row describe the real failing stage?

## Implementation expectations
1. Start by documenting the lifecycle state matrix before editing code.
2. Reassess the step ordering in `runLifecycleTransition(...)`. Do not preserve current ordering just because it already exists.
3. Preserve fail-closed binding lookup behavior.
4. Preserve the operational safety principle: lifecycle failure must never silently leave the page public.
5. If you keep or introduce compensation, it must reconcile **all** affected truth surfaces that need reconciliation, not just one row.
6. Keep archive and withdraw behavior parallel unless repo truth requires a meaningful divergence.
7. Keep manual non-page transitions (`transitionManual`) scoped unless the new lifecycle design requires a shared helper.

## Testing and validation requirements
Add or update lifecycle tests that prove the final state model for:

### Archive
- binding lookup failure
- page unpublish failure
- binding update failure after page demotion
- article update failure after page demotion
- history append failure after page/binding/article work

### Withdraw
- binding lookup failure
- page unpublish failure
- binding update failure after page demotion
- article update failure after page demotion
- history append failure after page/binding/article work

### Common proof
For every covered path, assert the resulting truth of:
- page live/draft state
- binding row fields
- master article fields
- workflow-history append success/failure
- publishing-error row stage classification

## Closure artifacts
Create a closure note under:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/`

The closure note must include:
- the chosen lifecycle failure model
- the archive matrix and withdraw matrix
- the reasoning for any step-order change
- changed files
- tests added/updated
- explicit note explaining how history-append failure is now handled without reintroducing false-live master state

## Anti-drift / non-deferral rules
- Do not defer the history-append contradiction into future work.
- Do not leave a branch where the master row says published while the page and binding are non-live unless you have genuinely restored those surfaces as well.
- Do not weaken page-unpublish safety to simplify compensation logic.
- Do not call this closed until archive and withdraw both have a complete, tested late-failure model.

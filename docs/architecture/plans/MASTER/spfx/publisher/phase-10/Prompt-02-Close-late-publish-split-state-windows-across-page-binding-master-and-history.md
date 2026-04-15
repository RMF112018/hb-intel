# Prompt 02 · Close late publish split-state windows across page, binding, master, and history

## Objective
Redesign the late-failure behavior of the publish/republish path so the final persisted truth is internally consistent after a failure that occurs **after the page publish has already succeeded**. The goal is to eliminate false-live or false-healthy states across the four coupled surfaces:
- destination page
- `HB Article Destination Pages`
- `HB Articles`
- `HB Article Workflow History`

## Critical operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Required repo anchors
Read and use these as binding implementation anchors:
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-publisher/src/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherContracts.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publisherRepositories.ts`
- `apps/hb-publisher/src/data/publisherAdapter/publishOrchestrator.test.ts`

Check any additional helper or page-generation seam you must touch, especially around page unpublish/demotion.

## Current issue in repo-truth terms
The current publish path is already stricter than the historical audit package assumed, but it still has an open late-failure consistency problem.

Today, after:
1. the page is successfully published, and
2. the binding row is successfully upserted,

a later failure in:
- `repositories.articles.upsert(updatedArticle)` (`articleSync` stage), or
- `repositories.workflowHistory.append(...)` (`historyAppend` stage)

triggers `rollbackPublishedPage(...)`, which demotes the page via `SavePageAsDraft`.

That is not enough.

The current code can still leave:
- the page demoted to draft / non-live
- the binding row still stamped as `PublishStatus='published'` and `SyncStatus='in-sync'`
- the master article either not updated at all (`articleSync` failure) **or** already updated to `WorkflowState='published'` with final page metadata (`historyAppend` failure)
- no workflow-history row for the failed closure step

That means the system can tell at least two contradictory stories at the same time.

This is no longer just a “binding rollback gap.” It is a **late publish split-state problem**.

## Required design task
You must choose and implement **one explicit late-publish consistency model**. Do not patch one field at a time without defining the model first.

Your design must cover all three meaningful publish shapes:
1. create from non-published content
2. republish in place
3. republish via regenerate

For each shape, define the final persisted state after:
- `articleSync` failure
- `historyAppend` failure

## Strong recommendation
Prefer a **fail-truthful** model over a shallow “rollback” that only restores one surface.

A partial rollback is not acceptable if it leaves the four surfaces disagreeing.

That means:
- do **not** leave the binding row published/in-sync if the page was demoted
- do **not** leave the master article published with final page identity if the page was demoted and closure failed, unless you also restored the page/binding to a genuinely live-consistent state
- do **not** fabricate workflow-history closure when it did not happen

If you choose full compensation instead of fail-truthful demotion, then the compensation must be real and must restore **all** affected truth surfaces, not just one.

## Intended future state
After this prompt is complete, every late publish failure path must end in one clearly explainable state model.

At minimum, the final persisted state must answer these questions consistently:
- Is the page live or not?
- Does the binding row describe a live, healthy destination page or a failed/pending/non-live one?
- Does the master article still claim published success, or does it reflect that closure failed?
- Is there a durable audit/error trail that matches what actually happened?

The exact field-level implementation is up to you, but the end result must be internally truthful.

## Implementation expectations
1. Write a short state matrix **before** you implement code. Cover create / in-place update / regenerate × articleSync failure / historyAppend failure.
2. Update `publishOrchestrator.ts` around the late-failure branches only as far as needed to implement that matrix.
3. Reconcile the binding row as part of the late-failure model. Do not leave it stale.
4. Reconcile the master article as part of the late-failure model. Do not leave it falsely claiming successful publish closure.
5. Preserve all currently correct success semantics:
   - create success
   - in-place republish success
   - regenerate success
   - no-op success
   - preview no-write behavior
6. Preserve the existing validation and policy gates unless repo truth forces a tightly-coupled adjustment.
7. Keep the failure classification in `HB Article Publishing Errors` technically precise.

## Testing and validation requirements
Add or update tests that prove the chosen state model for:

### Create path
- `articleSync` failure after page publish + binding write
- `historyAppend` failure after page publish + binding write

### Republish in-place
- late failure after page publish + binding write

### Regenerate
- late failure after new page identity is written

### Common proof
For every covered path, prove the final persisted state of:
- page live/draft status
- binding row fields
- master article fields
- workflow history presence/absence
- publishing error classification

Do not stop at one happy-path assertion and one error-row assertion. The point of this prompt is the full state story.

## Closure artifacts
Create a closure note under:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/`

The closure note must include:
- the exact late-publish consistency model chosen
- the state matrix by publish shape and failure stage
- changed files
- tests added/updated
- before/after state examples for at least one create failure and one republish failure

## Anti-drift / non-deferral rules
- Do not push part of the late-publish state problem into a future prompt.
- Do not leave the binding row or master article in a state that contradicts the page’s live state.
- Do not weaken republish policy gates or preview semantics to make the tests easier.
- Do not call this closed until create, in-place republish, and regenerate all have a defined and tested late-failure outcome model.

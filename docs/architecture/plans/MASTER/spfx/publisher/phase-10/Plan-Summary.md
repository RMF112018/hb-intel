# Plan Summary

## Repo-truth audit outcome
The prior package correctly identified the remaining risk area: failure-path discipline after the large SharePoint list-family rewiring was completed. The current `main` branch still has four open backend closure items, but their shapes have changed.

The four real closure items are now:

1. **Resolution read failures are still not fully typed or fully observable.**  
   `buildPublishResolutionContext(...)` still returns typed failures only for article-not-found and template-resolution failure. Repository read throws can still escape as raw exceptions.

2. **Late publish failures still leave contradictory persisted truth.**  
   After page publish and binding upsert succeed, late failures still demote the page without reconciling the binding row, and some paths also leave the master article falsely stamped as published.

3. **Archive/withdraw failure handling is safer than before, but still not internally truthful in every late-failure branch.**  
   The lifecycle path now fail-closes binding lookup and compensates some history failures, but one current compensation path rolls only the master row back while leaving the page and binding demoted.

4. **Draft save is still controller-owned and still permits ambiguous cross-list partial persistence.**  
   The child writers are no longer destructively delete-all/recreate-all, which is good, but the overall save pipeline still allows the master row to commit before child synchronization finishes.

## What changed from the original package
- **Prompt 01 is retained and substantially strengthened.**  
  The original issue is still open, but the updated prompt now covers all affected call sites, stage classification, and publishing-error observability expectations.

- **Prompt 02 is retained but broadened.**  
  The old wording focused too narrowly on the destination-binding rollback gap. Current repo truth shows the real defect is a wider late-publish split-state problem across **page, binding, master article, and workflow history**.

- **Prompt 03 is retained but materially expanded.**  
  The old package assumed the remaining archive/withdraw issue was limited to binding-update and article-update windows after page demotion. Current repo truth shows that the history-append branch also remains contradictory because the master row can be reverted while the page and binding stay demoted.

- **Prompt 04 is retained but reframed.**  
  The old prompt assumed child-row rewrites were still destructive. Repo truth shows child writers were already upgraded to keyed sync. The remaining issue is now **truthful orchestration of the overall save**, not the old delete-all implementation.

## Ordered implementation sequence
1. Normalize resolution-context failures and observability.
2. Close late publish split-state windows.
3. Redesign archive/withdraw late-failure handling so non-live truth stays internally consistent.
4. Extract and harden draft save orchestration.

## Why this is the correct sequence
- **Prompt 01 first** because resolution is upstream of preview, publish, and republish. Typed failure normalization gives the rest of the package a stable error contract.
- **Prompt 02 second** because publish/republish is the most operationally exposed truth boundary. It currently has the clearest false-live / false-healthy persistence risk.
- **Prompt 03 third** because archive/withdraw depends on the same style of failure-model thinking as Prompt 02, but the lifecycle safety goal is different: once public exposure is removed, the data model must converge to non-live truth.
- **Prompt 04 last** because it is authoring-save orchestration, not live-page exposure. It still matters for closure, but it is lower operational risk than publish/lifecycle truthfulness.

## No required-work deferrals
This package contains no required-work deferrals. If a dependency, compensating action, test seam, status model, or closure document is needed to make one of these four workstreams truthful, it belongs in this package now.

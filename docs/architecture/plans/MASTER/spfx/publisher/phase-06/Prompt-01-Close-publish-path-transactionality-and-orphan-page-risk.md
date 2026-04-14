# Prompt 01 — Close publish-path transactionality and orphan-page risk

## Objective
Fix the publish / republish pipeline so it cannot leave a live SharePoint page without coherent control-plane closure when a downstream binding/article/history step fails.

## Governing authority / required reference docs
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`

## Files and code paths to inspect
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
  - `run`
  - `recordPublishingError`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageShellService.ts`
  - `publishPage`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageGeneration/pageCreationService.ts`
  - `publishLive`
  - any compensating/unpublish capability you may need to reuse
- `apps/hb-webparts/src/homepage/data/publisherAdapter/pageBindingWriter.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- any tests covering publish / republish

## Exact defect to close
The current sequence publishes the destination page before binding write, article back-sync, and workflow-history closure. If a downstream step fails, the function returns an error but the page may already be live.

## Required implementation outcome
Implement a safe closure strategy for post-page failures. Choose the least risky repo-truth-aligned approach, such as:
- compensating rollback/unpublish when downstream closure fails, or
- a durable staged-state model that prevents “live page / stale control-plane” drift and gives operators an explicit recovery path.

The final design must make it impossible, or at least explicitly recoverable and fully tracked, for a page to be live while:
- no valid binding exists,
- `HB Articles` was not back-synced,
- publish closure is ambiguous.

## Validation / proof of closure requirements
Prove all of the following:
1. successful publish still works for `create`, `inPlaceUpdate`, and `regenerate`
2. simulated binding-write failure does not leave an untracked live page
3. simulated article-sync failure does not leave ambiguous control-plane state
4. simulated history-append failure is handled according to the chosen closure design
5. error logging still works and does not mask the real failure

Add or update tests that explicitly exercise downstream failure after page publish.

## Deliverables / closure docs to create
Create a closure note at:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/01-close-publish-path-transactionality-and-orphan-page-risk.md`

Include:
- exact design chosen
- files changed
- before/after sequence
- test evidence

## Explicit boundaries
- Do not widen destination support
- Do not add unrelated UI refactors
- Do not combine this with scheduled-state, milestone, promotion-rule, or team-viewer work

## Operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

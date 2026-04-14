# Prompt 02 — Make archive, withdraw, and manual transitions atomic

## Objective
Fix the non-publish transition paths so article state, page visibility, binding state, and workflow history do not drift when part of the lifecycle fails.

## Governing authority / required reference docs
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`

## Files and code paths to inspect
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
  - `runLifecycleTransition`
  - `archive`
  - `withdraw`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - `handleTransition`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
  - workflow-history append usage
- related tests

## Exact defect to close
The current lifecycle order updates the article before page unpublish, binding update, or history append complete. Generic transitions also update the article before history append. Partial failure can therefore leave:
- archived/withdrawn article + still-live page
- updated article state + stale binding
- updated article state + missing history row

## Required implementation outcome
Rework these flows so lifecycle closure is durable and auditable. The final design must:
- make archive/withdraw page visibility and control-plane state consistent,
- prevent silent article-state changes without matching history closure,
- surface partial-failure conditions explicitly if true atomicity is impossible.

## Validation / proof of closure requirements
Prove all of the following:
1. archive success closes article + page + binding + history coherently
2. withdraw success closes article + page + binding + history coherently
3. simulated page-unpublish failure does not leave an ambiguous lifecycle state
4. simulated binding-update failure is explicitly recoverable and logged
5. simulated history-append failure is handled according to the chosen design
6. generic manual transitions do not silently change state without auditable closure

## Deliverables / closure docs to create
Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/02-make-archive-withdraw-and-manual-transitions-atomic.md`

## Explicit boundaries
- Do not change scheduled-state policy here
- Do not add milestone/promotion/team-viewer work here
- Do not broaden destination scope here

## Operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

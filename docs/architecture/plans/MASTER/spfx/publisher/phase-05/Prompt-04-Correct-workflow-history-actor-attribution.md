# Prompt 04 — Correct workflow-history actor attribution

## Objective

Stop writing article-author identity into workflow history when the actual operator is a different current user.

## Governing authority / required reference docs

- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- `apps/hb-webparts/src/mount.tsx`

## Files and code paths to inspect

- SPFx current-user context available at mount/runtime
- ArticlePublisher props
- publish action calls
- archive / withdraw action calls
- workflow-history append payloads

## Exact defect to close

`ActorEmail` is currently derived from `AuthorEmail` instead of the actual operator.

## Required implementation outcome

Use the actual current operator identity for:
- publish history
- republish history
- archive history
- withdraw history
- any other workflow-history write that should represent the acting user

## Validation / proof of closure requirements

Prove:
- the actual operator identity is available to the component/orchestrator
- workflow-history writes no longer default to article author when the operator is different
- no unrelated list contracts were changed

## Deliverables / closure docs

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/04-closure-actor-attribution.md`

## Constraint

Do not broaden this into general auth redesign.
Do not make unrelated changes.
Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.

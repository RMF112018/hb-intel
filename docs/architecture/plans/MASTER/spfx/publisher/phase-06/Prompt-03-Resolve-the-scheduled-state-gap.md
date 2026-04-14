# Prompt 03 — Resolve the scheduled-state gap

## Objective
Close the mismatch between the tenant workflow schema and the live app by deciding whether `scheduled` is a real operational state or a schema-only future placeholder.

## Governing authority / required reference docs
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- any existing publisher architecture docs that define scheduling expectations

## Files and code paths to inspect
- `apps/hb-webparts/src/homepage/data/publisherAdapter/workflowStateMachine.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publishOrchestrator.ts`
- any validation/UI docs or tests that mention `scheduled`

## Exact defect to close
`scheduled` exists in the tenant schema and enum surface, but the app intentionally forbids inbound transitions and has no scheduled-publish executor.

## Required implementation outcome
Choose one bounded direction and close it thoroughly:

### Option A — implement scheduling
- admit inbound transitions into `scheduled`
- define publish prerequisites
- implement a real execution path for scheduled publish
- define audit/history/error semantics

### Option B — scope it out cleanly for now
- remove or hide scheduled from live user flows
- keep read compatibility only where needed
- make docs, validation, and UI consistent about the branch being unsupported

Use the safer option unless there is already a proven scheduled-publish architecture in the repo.

## Validation / proof of closure requirements
- prove the state machine, UI, and docs now agree
- prove no dead-end scheduled branch remains in the live user flow
- add/adjust tests for the final chosen posture

## Deliverables / closure docs to create
Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/03-resolve-the-scheduled-state-gap.md`

## Explicit boundaries
- Do not implement unrelated workflow refactors
- Do not widen destination support here
- Do not combine with milestone work

## Operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

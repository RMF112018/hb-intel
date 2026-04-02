# Prompt-05 — Audit Retrieval APIs and Query Contracts

## Objective

Implement the retrieval/query layer for Phase 4 so operators and later UI phases can review runs, audit events, and evidence references through clean backend contracts.

This prompt is about read/query rails, not broad SPFx UI work.

## Important execution rules

- Do **not** re-read files already in context unless needed.
- Keep retrieval/query contracts additive and backward-compatible.
- Avoid broad UI implementation. Only make minimal client/shared updates required for API compatibility.

## Inputs

Use:
- generalized stores from Prompt-03
- provisioning bridge changes from Prompt-04
- `packages/provisioning/src/api-client.ts`
- current backend function route conventions
- Phase 4 baseline docs

## Required implementation work

### A. Backend retrieval routes
Add the smallest useful generalized routes for:
- list admin runs
- get admin run detail
- list admin audit events for a run and/or query filter
- get evidence manifest / evidence references for a run

Support filtering and paging only to the extent justified by repo maturity.
Do not over-engineer search.

### B. Query contract design
Define stable request/response shapes for:
- run summary list
- run detail
- audit event list
- evidence manifest view

Use typed shared models where appropriate.

### C. Compatibility guidance
Do not remove current provisioning-specific endpoints in this prompt.
If useful, add compatibility adapters or translation helpers so provisioning consumers can gradually converge toward generalized reads later.

### D. Minimal client/shared updates
Update shared API/client contracts only as needed so later phases have a stable way to call the new generalized retrieval APIs.

Do not build broad admin pages in this prompt.

## Required tests

Add targeted tests for:
- route authorization
- query parameter validation
- summary/detail retrieval
- empty-state handling
- evidence-manifest retrieval
- backward compatibility with untouched provisioning-specific routes

## Required documentation updates

Create:
- `docs/architecture/plans/MASTER/spfx/admin/phase-4/admin-spfx-phase-4-retrieval-api-contract.md`

The doc must describe:
- generalized read endpoints,
- response shapes,
- compatibility posture relative to provisioning-specific reads,
- and expected operator-review use cases.

## Validation

Run the smallest credible validation set for touched backend/shared files.

## Completion condition

Stop when generalized retrieval/query rails exist, are typed, and are validated without forcing premature UI buildout.

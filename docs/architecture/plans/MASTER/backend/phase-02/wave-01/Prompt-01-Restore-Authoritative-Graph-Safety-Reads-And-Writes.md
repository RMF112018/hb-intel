# Prompt 01 — Restore Authoritative Graph Safety Reads and Writes

## Objective

Execute a forceful repo-truth closure pass on the Safety ingestion backend so that the live `safetyIngestWorkbook` lane performs authoritative HBCentral and Safety-site reads/writes through the intended Graph-first path and no longer fails at reporting-period access.

This is not a theory pass.
This is not a generic refactor.
This is a closure task.

You must determine exactly why live behavior is still returning a reporting-period `401` when current `main` indicates a Graph-first ingestion path, then implement the minimum correct set of code, config-validation, diagnostics, and tests required to eliminate that mismatch.

## Governing authorities

Use these as the decision authorities:

- current repo truth on `main`
- Azure Functions Node v4 / Flex Consumption deployment expectations
- Microsoft Graph list/file API behavior and app-only permission model
- current Safety cutover direction: Graph-only application-facing data plane
- parser/preview/commit architecture already present in the Safety backend

## Files and seams to inspect

At minimum inspect and work from:

- `backend/functions/src/services/sharepoint-service.ts`
- `backend/functions/src/services/safety-ingestion-graph-repository.ts`
- `backend/functions/src/services/safety-ingestion-graph-data-plane.ts`
- `backend/functions/src/services/managed-identity-token-service.ts`
- `backend/functions/src/services/safety-ingestion-preview-evaluator.ts`
- `backend/functions/src/services/__tests__/safety-ingestion-cutover-guard.test.ts`
- `packages/features/safety/src/lists/descriptors.ts`
- `packages/features/safety/src/lists/guidConfig.ts`
- any Safety list/site descriptor and GUID overlay seams reached from the files above
- any startup/preflight/config validation seam that governs Safety runtime correctness

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Current backend gap to close

Current repo truth says the Safety ingestion lane is Graph-first.
Current live evidence says reporting-period access still fails with `401`.

That means one or more of these is still unresolved:

- deployed artifact drift vs source
- wrong site/list binding at runtime
- wrong GUID overlay or descriptor resolution
- wrong runtime identity selection
- missing or mis-scoped Graph permissions / grants
- inadequate diagnostics causing the real failure class to be hidden

You must close that ambiguity.

## Required implementation outcome

Implement the backend so that:

1. the Safety ingestion lane uses the Graph repository/data plane as the sole authoritative data-plane seam for:
   - reporting period read
   - upload library write
   - project-week lookup/create/update
   - inspection event create
   - findings create
   - replay source download

2. runtime diagnostics clearly distinguish:
   - 401/403 permission failures
   - wrong site binding
   - wrong list ID / list not found
   - identity selection mismatch
   - artifact/runtime drift indicators

3. Safety startup/preflight validation fails loudly and specifically when required Graph/list/site bindings are absent or malformed

4. the live route can be proven to execute the Graph-first code path on `main`

Do not reintroduce SharePoint REST / PnP data-plane calls into the Safety ingest/replay hot path.

## Proof of closure required

Provide proof, not prose.

At minimum:

- updated tests guarding against regression back to REST/PnP data-plane usage
- targeted tests covering descriptor/GUID/runtime binding failure classes
- explicit diagnostics for reporting-period read failure
- evidence that the authoritative repo path remains Graph-only
- if live access is available, a post-change smoke sequence showing:
  - preview succeeds
  - ingest succeeds
  - list deltas change as expected

If live execution is not available, provide the exact smoke commands and the expected structured outputs.

## Constraints

- no unrelated homepage/SPFx/UI work
- no broad “cleanups” outside the Safety backend lane
- no weakening of commit gating
- no vague TODO closure
- do not preserve weak mixed seams merely because they already exist


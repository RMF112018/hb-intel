# 04 — Phased Implementation Plan

## Phase 01 — Architecture, schema, and repo-truth lock

### Objective

Document the target architecture and add schema/list definitions for dynamic Safety Field Excellence without changing runtime behavior.

### Tasks

- Add architecture cutover doc under `docs/architecture/plans/MASTER/spfx/safety-public/`.
- Add list schema docs under `docs/reference/sharepoint/list-schemas/hbcentral/lists/`.
- Extend `packages/features/safety/src/lists/descriptors.ts`.
- Extend `packages/features/safety/src/lists/fieldSchema.ts`.
- Extend `backend/functions/src/config/safety-record-keeping-list-definitions.ts`.
- Add indexing requirements.
- Add package README notes for dynamic cutover.

### Acceptance

- No existing homepage runtime behavior changes.
- No existing Safety ingestion behavior changes.
- Typecheck passes.
- Schema docs and code align.

## Phase 02 — Excellence scoring domain package

### Objective

Add pure TypeScript domain logic for eligibility, scoring, preview fallback payload generation, and homepage payload shaping.

### Tasks

- Add `packages/features/safety/src/excellence/**`.
- Implement eligibility gates.
- Implement scoring dimensions.
- Implement low-activity perfect-score suppression.
- Implement data-quality scoring.
- Implement narrative generator.
- Implement homepage payload builder.
- Add tests.

### Acceptance

- Unit tests prove low-activity 100% is suppressed.
- Unit tests prove multi-signal candidates can pass.
- No backend or homepage runtime changes yet.

## Phase 03 — Backend Function App rollup service

### Objective

Connect the scoring package to actual Safety records through the existing backend Function App.

### Tasks

- Add Graph repository methods.
- Add rollup service.
- Add dry-run endpoint.
- Add candidate write endpoint.
- Add telemetry.
- Add failure classifications.

### Acceptance

- Dry-run generates candidate JSON.
- Generate writes candidate list items.
- Existing Function App deployment model remains intact.
- Existing Safety ingestion routes remain unchanged.

## Phase 04 — Weekly timer and draft highlight

### Objective

Automate candidate generation and draft weekly highlight creation.

### Tasks

- Add timer trigger.
- Schedule from app setting.
- Do not use `RunOnStartup=true` in production.
- Add idempotent upsert behavior.
- Create draft highlight.
- Add manual invocation/testing path.

### Acceptance

- Timer job can be manually invoked for smoke proof.
- Dry-run mode creates no writes.
- Rerun does not duplicate candidates.
- Draft highlight is generated but not auto-published.

## Phase 05 — Approval, override, publish, suppress

### Objective

Give Safety leadership control over homepage publication.

### Tasks

- Add admin APIs for candidate review.
- Add approve route.
- Add override route with required reason.
- Add publish route.
- Add suppress route.
- Add rollback route.
- Freeze homepage payload at publish.

### Acceptance

- Published artifact contains `HomepagePayloadJson`.
- Override is audited.
- Suppress prevents homepage publication.
- Published payload contains no individual employee-sensitive detail.

## Phase 06 — Homepage dynamic adapter

### Objective

Add dynamic read capability while keeping current curated behavior by default.

### Tasks

- Add source-mode contract.
- Add dynamic provider.
- Add backend read client to current Function App.
- Add mapper from published payload to current config contract.
- Add runtime proof object.
- Add preview fallback state.

### Acceptance

- Default `curated-only` behavior unchanged.
- `dynamic-preview` fetches but does not publicly replace curated content.
- `dynamic-with-curated-fallback` works.
- Preview fallback renders when no data exists.
- Unit tests pass.

## Phase 07 — UI/UX flagship hardening

### Objective

Close checklist and scorecard gaps before production cutover.

### Tasks

- Audit against checklist.
- Score against scorecard.
- Refine layout/hierarchy.
- Validate breakpoint/shell fit.
- Validate accessibility.
- Validate preview fallback quality.
- Capture evidence.

### Acceptance

- 48+/56 scorecard target.
- No hard-stop failures.
- Hosted evidence captured.

## Phase 08 — Hosted cutover

### Objective

Deploy, prove, and progressively enable the dynamic source.

### Tasks

- Package truth verification.
- Deploy backend Function App changes.
- Deploy SPFx package.
- Enable `dynamic-preview`.
- Validate dynamic payload.
- Enable `dynamic-with-curated-fallback`.
- Run one weekly cycle.
- Enable `dynamic-only` only after proof.

### Acceptance

- Runtime proof shows dynamic source.
- Published highlight appears on HBCentral.
- No raw aggregation in browser.
- Fallback behavior works.
- Rollback path is documented and tested.

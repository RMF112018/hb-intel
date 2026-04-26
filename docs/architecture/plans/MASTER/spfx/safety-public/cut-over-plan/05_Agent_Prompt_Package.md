# 05 — Agent Prompt Package

## Prompt 01 — Schema and architecture foundation

```md
You are working in a fresh ChatGPT/Codex session in the live `RMF112018/hb-intel` repository. Main is authoritative.

## Objective

Implement the schema and architecture foundation for cutting over Safety Field Excellence from curated homepage config to a dynamic weekly published highlight artifact powered by the existing Safety backend Function App.

## Read First

Do not re-read files that are still within your current context or memory.

Inspect current repo truth:

- apps/hb-webparts/src/webparts/safetyFieldExcellence/**
- apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx
- apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts
- apps/hb-webparts/src/homepage/helpers/operationalAwarenessConfig.ts
- packages/features/safety/src/lists/descriptors.ts
- packages/features/safety/src/lists/fieldSchema.ts
- backend/functions/src/config/safety-record-keeping-list-definitions.ts
- docs/reference/ui-kit/doctrine/**
- docs/reference/spfx-surfaces/benchmark/**
- docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md
- docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md

## Scope

- Add docs for dynamic Safety Field Excellence architecture.
- Add list schema docs for Candidate Scores and Weekly Highlights.
- Extend safety list descriptors.
- Extend field schema.
- Extend backend provisioning definitions.
- Add index requirements.

## Constraints

- Do not implement scoring yet.
- Do not change current homepage behavior.
- Do not change Safety ingestion behavior.
- Do not change backend auth posture.
- Do not add a second backend app.
- Use the existing backend Function App currently used by Safety.

## Required Output

- Plan Summary
- Changed files
- Schema summary
- Verification results
- Risk register
- Next prompt readiness
```

## Prompt 02 — Scoring package

```md
You are working in a fresh ChatGPT/Codex session in `RMF112018/hb-intel`. Main is authoritative.

## Objective

Create the pure domain package for dynamic Safety Field Excellence scoring and homepage payload generation.

## Scope

Add:

- packages/features/safety/src/excellence/types.ts
- packages/features/safety/src/excellence/eligibility.ts
- packages/features/safety/src/excellence/scoring.ts
- packages/features/safety/src/excellence/exposure.ts
- packages/features/safety/src/excellence/correctiveActions.ts
- packages/features/safety/src/excellence/narrative.ts
- packages/features/safety/src/excellence/homepagePayload.ts
- tests for all of the above

## Strict Rules

- Never select a project based only on one inspection score.
- Suppress or downgrade low-activity 100% score artifacts.
- Require active project and meaningful field-activity evidence.
- Require multi-signal narrative.
- Do not write backend Graph code in this prompt.
- Do not write homepage UI code in this prompt.
- Do not re-read files still within your current context.

## Required Tests

- single 100% inspection + missing activity evidence = not eligible for primary highlight
- 100% score during mobilization/closeout-only stage = not eligible without exposure proof
- strong rolling performance + active field evidence = eligible
- aged high-risk open finding = excluded or downgraded
- near-duplicate inspection = data-quality penalty
- missing corrective-action fields = confidence penalty
- narrative cites at least two independent signals

## Required Output

- Plan Summary
- Changed files
- Scoring formula
- Test results
- Closure proof
```

## Prompt 03 — Backend Function App rollup APIs

```md
You are working in a fresh ChatGPT/Codex session in `RMF112018/hb-intel`. Main is authoritative.

## Objective

Implement backend Function App rollup services and APIs for Safety Field Excellence candidate generation.

## Scope

Add or update:

- backend/functions/src/services/safety-field-excellence-graph-repository.ts
- backend/functions/src/services/safety-field-excellence-rollup-service.ts
- backend/functions/src/functions/adminApi/safety-field-excellence-routes.ts
- backend/functions/src/services/sharepoint-service.ts if current architecture requires service facade wiring
- relevant tests

## Integration Requirement

This must use the backend Function App currently used by the Safety application. Do not create a separate app.

## Required Routes

- POST /api/safety-field-excellence/rollup/dry-run
- POST /api/safety-field-excellence/rollup/generate
- GET /api/safety-field-excellence/reporting-periods/{id}/candidates

## Constraints

- Preserve current Safety ingestion routes.
- Preserve current backend authorization posture.
- Use bounded Graph queries.
- Use indexed filters.
- Do not use homepage client aggregation.
- Do not expose raw workbook JSON through homepage routes.
- Do not re-read files still within your current context.

## Required Proof

- Dry-run response proof.
- Candidate write proof.
- Query contract proof.
- Existing Safety backend tests still pass.
```

## Prompt 04 — Weekly timer and publish workflow

```md
You are working in a fresh ChatGPT/Codex session in `RMF112018/hb-intel`. Main is authoritative.

## Objective

Implement the weekly timer-generated draft highlight plus Safety leadership approval/publish workflow.

## Scope

Add:

- backend/functions/src/functions/scheduled/safety-field-excellence-weekly-rollup.ts
- backend/functions/src/services/safety-field-excellence-publish-service.ts
- routes:
  - GET /api/safety-field-excellence/highlights/{id}
  - POST /api/safety-field-excellence/highlights/{id}/approve
  - POST /api/safety-field-excellence/highlights/{id}/override
  - POST /api/safety-field-excellence/highlights/{id}/publish
  - POST /api/safety-field-excellence/highlights/{id}/suppress
  - POST /api/safety-field-excellence/highlights/{id}/rollback

## Constraints

- Do not auto-publish without approval.
- Override requires reason.
- Hard-excluded candidates require explicit override reason.
- Do not set RunOnStartup=true in production.
- Freeze HomepagePayloadJson at publish time.
- Do not re-read files still within your current context.

## Required Proof

- Timer dry-run proof.
- Idempotent rerun proof.
- Approval audit proof.
- Override reason proof.
- Published payload proof.
```

## Prompt 05 — Homepage dynamic adapter and preview fallback

```md
You are working in a fresh ChatGPT/Codex session in `RMF112018/hb-intel`. Main is authoritative.

## Objective

Cut the Safety Field Excellence homepage surface over to support dynamic published highlights from the existing backend Function App while preserving current curated behavior by default.

## Scope

Update/add:

- apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellence.tsx
- apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellenceConsumerModel.tsx
- apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDynamicProvider.tsx
- apps/hb-webparts/src/webparts/safetyFieldExcellence/SafetyFieldExcellenceDataAdapter.ts
- apps/hb-webparts/src/webparts/safetyFieldExcellence/safetyFieldExcellencePayloadMapper.ts
- apps/hb-webparts/src/webparts/hbHomepage/zones/SafetyFieldExcellenceZone.tsx
- apps/hb-webparts/src/homepage/webparts/operationalAwarenessContracts.ts
- tests

## Source Modes

Implement:

- curated-only
- dynamic-preview
- dynamic-with-curated-fallback
- dynamic-only

Default must remain curated-only.

## Preview Fallback Requirement

When no dynamic content exists, render a polished preview of the future Safety Field Excellence state. It must show the intended layout, sample/example evidence labels, and honest copy that real weekly Safety data has not yet been published.

Do not render a weak blank empty card.

## UI Requirements

Use:

- docs/reference/ui-kit/doctrine/**
- homepage checklist
- homepage scorecard
- HbcSafetyHomepageSurface / @hbc/ui-kit/homepage where appropriate

Target:

- 48+/56 scorecard
- no hard-stop failures
- no generic white-card posture
- credible standard/compact/minimal behavior

## Constraints

- Do not aggregate raw Safety records in the browser.
- Do not redesign the homepage shell.
- Do not remove curated fallback.
- Do not introduce dead CTA paths.
- Do not re-read files still within your current context.

## Required Proof

- Unit tests for all source modes.
- Preview fallback screenshot or local evidence.
- Runtime proof object.
- Existing curated config still works.
```

## Prompt 06 — UI/UX flagship audit and remediation

```md
You are working in a fresh ChatGPT/Codex session in `RMF112018/hb-intel`. Main is authoritative.

## Objective

Audit and remediate the dynamic Safety Field Excellence surface against the homepage checklist and scorecard until it reaches flagship-grade acceptance.

## Required Inputs

- docs/reference/ui-kit/doctrine/**
- docs/reference/spfx-surfaces/benchmark/**
- docs/reference/spfx-surfaces/homepage-uiux-audit-checklist.md
- docs/reference/spfx-surfaces/homepage-uiux-audit-scorecard.md
- current hbKudos public runtime benchmark traits

## Scope

- Audit visual hierarchy.
- Audit shell-fit.
- Audit standard/compact/minimal behavior.
- Audit preview fallback.
- Audit state model.
- Audit interaction completeness.
- Audit accessibility.
- Remediate material gaps.

## Required Score

- Target 48+/56.
- No hard-stop failures.
- No category below 3 without explicit written exception.
- Doctrine controls over scorecard if stricter.

## Required Output

- Completed scorecard.
- Gap register.
- Remediated files.
- Hosted/local evidence.
- Remaining exceptions, if any.
```

## Prompt 07 — Hosted deployment and cutover proof

```md
You are working in a fresh ChatGPT/Codex session in `RMF112018/hb-intel`. Main is authoritative.

## Objective

Prepare hosted proof and production cutover for the dynamic Safety Field Excellence homepage surface.

## Scope

- Verify backend Function App deployment.
- Verify SPFx package truth.
- Verify HBCentral homepage runtime.
- Enable dynamic-preview.
- Validate backend payload.
- Enable dynamic-with-curated-fallback.
- Validate fallback.
- Document rollback.
- Do not enable dynamic-only until hosted proof passes.

## Required Proof

- Backend health and route proof.
- Published weekly highlight item ID.
- Homepage runtime proof object:
  - sourceMode
  - dataSource
  - publishedHighlightId
  - reportingPeriodId
  - publishStatus
  - freshUntil
  - isStale
  - dataConfidence
  - fallbackReason
  - packageVersion
  - expectedPackageVersion
- Hosted screenshots.
- Console review.
- Scorecard final.
- Rollback steps.

## Constraints

- Do not declare closure from local tests alone.
- Do not assume package deploy equals runtime binding.
- Do not remove fallback until at least one full hosted weekly cycle passes.
```

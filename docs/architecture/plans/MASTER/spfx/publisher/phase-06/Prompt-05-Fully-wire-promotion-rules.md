# Prompt 05 — Fully wire promotion rules

## Objective
Make the `HB Article Promotion Rules` seam real instead of partially decorative.

## Governing authority / required reference docs
- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/promotionRuleSelector.ts`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- any related rollout/homepage/destination architecture docs in the publisher area

## Files and code paths to inspect
- `promotionRuleSelector.ts`
- `ArticlePublisher.tsx`
  - promotion-rule loading
  - new-article creation
  - any feature/pin authoring controls
- `publisherContracts.ts`
- `publisherWriters.ts`
- any downstream rollup/destination consumers if they exist in repo

## Exact defect to close
Promotion rules are only used once at draft creation, seeded with hard-coded `projectSpotlight + monthlySpotlight` defaults, and manual override/homepage/global behavior is not enforced.

## Required implementation outcome
Close the seam consistently. At minimum:
- remove hard-coded default seeding assumptions,
- base defaults on the actual article state,
- decide and implement how manual override is enforced,
- explicitly handle or explicitly defer homepage/global rule behavior.

The final state must not imply richer promotion-rule control than the app actually performs.

## Validation / proof of closure requirements
- prove rule selection matches destination/content-type correctly
- prove the UI either enforces or explicitly omits manual override rules
- prove draft creation is not hard-coded to the wrong promotion context
- add/update tests for destination/content-type-specific rule selection

## Deliverables / closure docs to create
Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/05-fully-wire-promotion-rules.md`

## Explicit boundaries
- Do not widen destinations unless the audit path proves it is necessary
- Do not fold in unrelated workflow safety changes
- Do not perform broad UI redesign beyond what this seam requires

## Operating instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

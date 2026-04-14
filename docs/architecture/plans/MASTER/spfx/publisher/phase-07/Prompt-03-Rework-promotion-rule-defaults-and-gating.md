# Prompt 03 — Rework promotion-rule defaults and gating

## Objective

Close the defect where promotion rules are technically wired but only partially real in the current editor.

## Governing authority / required references

Treat the following as binding:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/promotionRuleSelector.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publisherContracts.ts`

## Files and code paths to inspect

At minimum inspect:
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - `handleCreateNew`
  - current create-time promotion default seeding
  - any UI state or lack of UI for `IsFeatured` / `IsPinned`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/promotionRuleSelector.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
  - promotion rules read path
- any tests around promotion rules or new-article creation

## Exact defect to close

Current behavior:
- new article creation seeds promotion defaults using hardcoded `projectSpotlight` + `monthlySpotlight`
- operator can later change destination and content type
- editor does not recompute defaults to follow the article's actual final discriminator values
- `ManualOverrideAllowed` is not enforced in the current surface
- `IsFeatured` / `IsPinned` are not surfaced as a real controlled authoring seam

## Required implementation outcome

Make promotion-rule behavior honest and deterministic for the current sprint.

Minimum acceptable closure:
- new-article defaults must be derived from the article's actual discriminator values, not from hardcoded initial assumptions
- if the current sprint does not expose `IsFeatured` / `IsPinned`, then the code and comments must reflect a narrowed behavior without false promises
- if you do expose them, you must enforce `ManualOverrideAllowed` correctly

Preferred closure:
- recompute or normalize defaults before the first persisted save whenever `Destination` or `ArticleContentType` changes
- keep the current sprint intentionally narrow if full override UX is still out of scope

## Validation / proof of closure requirements

Prove all of the following:
- defaults are no longer seeded from a hardcoded monthly/project-spotlight assumption when the article ends up elsewhere in the supported discriminator space
- current behavior is accurately represented in comments and UI affordances
- there is no false claim of override enforcement if the UI still does not expose override controls

## Deliverables / closure docs

Create:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/closure/closure-promotion-rule-behavior.md`

The closure note must include:
- exact files changed
- before/after behavior
- whether the final state is a true enforcement implementation or an intentional scope narrowing

## Explicit instruction not to make unrelated changes

Do not implement company-pulse destination support, do not alter scheduled workflow handling, and do not fold in unrelated UI cleanup.

## Operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

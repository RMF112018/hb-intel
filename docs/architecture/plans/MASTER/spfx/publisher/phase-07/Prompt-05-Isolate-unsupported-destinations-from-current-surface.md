# Prompt 05 — Isolate unsupported destinations from the current surface

## Objective

Prevent unsupported future-destination rows from bleeding into the current Project Spotlight-only authoring surface.

## Governing authority / required references

Treat the following as binding:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/destinationSiteUrls.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `/Users/bobbyfetting/hb-intel/apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`

## Files and code paths to inspect

At minimum inspect:
- `apps/hb-webparts/src/homepage/data/publisherAdapter/publisherRepositories.ts`
  - `listByWorkflowState`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
  - list-pane load path
  - destination select
- `apps/hb-webparts/src/homepage/data/publisherAdapter/destinationSiteUrls.ts`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/validation/validationEngine.ts`

## Exact defect to close

Current behavior:
- tenant schema includes `companyPulse` and `projectSpotlight`
- the current surface only truly supports `projectSpotlight`
- article-list loading is workflow-state-only, not destination-scoped
- future unsupported destination rows can therefore appear in a UI that is not meant to operate on them

## Required implementation outcome

Make the current surface intentionally scoped.

Preferred closure:
- filter list queries and authoring surface behavior to supported destinations only

Acceptable alternative:
- allow unsupported rows to load only in an explicit read-only or unsupported-state mode with clear messaging and no misleading action buttons

Do not leave unsupported rows to fail late in validation after already appearing as ordinary editable items.

## Validation / proof of closure requirements

Prove all of the following:
- unsupported destination rows are either excluded or clearly handled
- the current Project Spotlight-only authoring surface cannot accidentally present unsupported rows as normal editable/publishable records
- create / preview / publish paths still work for supported destinations

## Deliverables / closure docs

Create:
- `/Users/bobbyfetting/hb-intel/docs/architecture/plans/MASTER/spfx/publisher/closure/closure-supported-destination-scoping.md`

The closure note must include:
- exact files changed
- final scoping rule
- proof that unsupported rows no longer behave as ordinary supported items in this surface

## Explicit instruction not to make unrelated changes

Do not implement full company-pulse support in this prompt. This prompt is only about honest scoping / isolation.

## Operating instruction

Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

# Prompt 01 — Fix hosted project lookup host binding

## Objective

Close the host-site lookup defect in the Publisher so the project picker always queries the authoritative HBCentral `Projects` list instead of the current host page site. The hosted page under review is on Marketing-New, so this is a real hosted-path defect, not a theoretical cleanup.

## Governing authority / required reference docs

- `docs/architecture/plans/MASTER/spfx/publisher/architecture/lists/publisher-list-schema-report.md`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/projectsLookupSource.ts`

## Files and code paths to inspect

- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisher.tsx`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/projectsLookupSource.ts`
- `any shared SharePoint host-site constant module already used for publisher control-plane lists`

## Exact defect to close

`createProjectsLookupSearch` expects an HBCentral host site, but the current runtime passes the current page `siteUrl` through `mount.tsx` into `ArticlePublisher.tsx`, which means the hosted Marketing-New page will query the wrong site unless it coincidentally hosts the same `Projects` list.

## Required implementation outcome

Refactor the project-lookup seam so it is bound to the canonical HBCentral control-plane site explicitly. The current page `siteUrl` may still be used for true host-context concerns, but not for the authoritative Projects lookup.

Preferred direction:
- introduce or reuse a single canonical HBCentral site-url constant for the lookup seam
- stop deriving project lookup from the mounted page host
- keep the change tightly bounded to the project lookup path

## Validation / proof of closure requirements

You must prove:
1. the search function no longer depends on the mounted page site URL
2. the HBCentral control-plane site is the actual lookup target
3. existing authoring behavior still compiles and works
4. no unrelated list host bindings were changed

Create a concise closure proof showing:
- old path
- new path
- exact files changed
- why Marketing-New now resolves against HBCentral

## Deliverables / closure docs to create

Create:
- `docs/architecture/plans/MASTER/spfx/publisher/closure/closure-fix-hosted-project-lookup-host-binding.md`
- include repo-truth evidence, files changed, validation performed, and any remaining assumptions

## Guardrails

- Work in the live local repo.
- Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Conduct an exhaustive scrub of the affected code path before making changes.
- Prove closure of this issue before moving to the next prompt.
- Do not make unrelated changes.

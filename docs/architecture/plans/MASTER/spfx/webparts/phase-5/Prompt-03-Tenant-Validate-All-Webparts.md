# Prompt 03 — Tenant Validate All Webparts

## Objective

Validate the cumulative `hb-webparts` package in the tenant and confirm that **all homepage webparts in the package** can be added and rendered without reintroducing the historical loader failure.

Hero banner and action rail should be validated first as regression checks, but this prompt must continue through the full webpart set.

## Validation order

### Regression checks first
1. HbHeroBanner
2. PriorityActionsRail

### Then validate the remaining homepage webparts
3. CompanyPulse
4. LeadershipMessage
5. PeopleCulture
6. ToolLauncherWorkHub
7. ProjectPortfolioSpotlight
8. PersonalizedWelcomeHeader
9. SafetyFieldExcellence
10. SmartSearchWayfinding

If the tenant toolbox ordering differs, map by title + manifest ID and continue.

## Required manual/operator steps

1. Upload the rebuilt `hb-webparts.sppkg` to the App Catalog.
2. Trust/overwrite as needed.
3. Clear or sanity-check cache/service worker if stale behavior is suspected.
4. Add or load each webpart from the package on a test page.
5. Capture render outcome and console/runtime evidence.

## Required evidence per webpart

For each webpart, record:
- toolbox presence
- whether it can be added to the page
- whether it renders
- whether any `Could not load ... in require` error occurs
- whether any SharePoint technical-details crash shell appears
- whether required shell/bundle requests succeed

## Required output format

Create a validation matrix for all webparts with columns like:
- webpart
- manifest ID
- toolbox visible
- add to page
- renders
- load error absent
- notes

## Acceptance standard

This cumulative phase is only proven when:
- all intended packaged homepage webparts are tenant-visible
- all can be added
- all render
- no historical loader failure is present for any of them

If some pass and some fail, report partial completion clearly and isolate the failing webparts precisely.

## Hard constraints

- Do not stop after validating hero + rail.
- Do not collapse the results into a general statement like “the package works.”
- Do not hide partial failures.
- Do not assume page-level console noise is caused by the currently tested webpart unless the stack or loader evidence supports it.

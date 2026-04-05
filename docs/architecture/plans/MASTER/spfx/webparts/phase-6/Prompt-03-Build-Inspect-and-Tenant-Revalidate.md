# Prompt 03 — Build, Inspect, and Tenant Revalidate the Remediated Cumulative Package

## Objective

Build the remediated cumulative `hb-webparts` package, inspect it as package truth, then tenant-revalidate the cumulative package.

## Required build/package work

1. rebuild the cumulative package
2. inspect the emitted `.sppkg`
3. verify loader/package coherence for the cumulative model

## Required package inspection

At minimum verify:

### Inclusion
- all intended homepage webparts remain packaged

### Identity
For every packaged webpart:
- manifest ID
- alias
- entryModuleId
- scriptResources mapping

### Assets
- shell asset(s)
- Vite bundle
- alias/shim assets if the remediated architecture still uses them
- any newly introduced cumulative mapping assets

### Non-regression
- `HbHeroBannerWebPart` still included
- `PriorityActionsRailWebPart` still included
- package version is valid 4-part format

## Required tenant validation order

### First: regression checks
1. HbHeroBanner
2. PriorityActionsRail

### Then: cumulative validation
3. CompanyPulse
4. LeadershipMessage
5. PeopleCulture
6. ToolLauncherWorkHub
7. ProjectPortfolioSpotlight
8. PersonalizedWelcomeHeader
9. SafetyFieldExcellence
10. SmartSearchWayfinding

## Required evidence per webpart

Record:
- toolbox presence
- add-to-page success
- render success
- whether `Could not load ... in require` occurs
- whether SharePoint technical-details crash shell appears

## Required output

Create a validation matrix for all homepage webparts and state clearly whether the remediated cumulative package is now healthy in tenant.

## Hard constraints

- Do not stop after validating only hero + rail.
- Do not call the cumulative model fixed unless the full validation scope is completed or clearly reported as partial.
- If some still fail, isolate the failing webparts and failure signatures precisely.

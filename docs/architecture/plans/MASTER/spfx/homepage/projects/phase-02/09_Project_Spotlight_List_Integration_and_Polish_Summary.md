# Project Spotlight — List Integration and Polish Summary

## Package objective

This package instructs the code agent to evolve Project Spotlight from a structurally correct, mostly manifest-driven implementation into a doctrine-governed, list-backed, flagship homepage storytelling surface.

## Workstreams covered

1. Repo-truth and doctrine audit
2. SharePoint list data-source wiring
3. Media reliability and fallback system
4. Featured hierarchy and typography polish
5. Supporting rail and team strip refinement
6. Header/CTA and authoring refinement
7. Responsive/accessibility/performance hardening
8. Final validation and documentation

## SharePoint list source

- `Homepage Project Spotlights`
- URL: `https://hedrickbrotherscom.sharepoint.com/:l:/s/HBCentral/JADvLnv0cpkIT4efISyXzsq2Aa__8DCtUecvBuuaPMd2fAY?e=P0wGez`

## SharePoint fields in scope

- `Title`
- `ProjectId`
- `ProjectUrl`
- `HomepageEnabled`
- `IsFeatured`
- `DisplayOrder`
- `Headline`
- `Summary`
- `LocationText`
- `Sector`
- `PrimaryImage`
- `PrimaryImageAltText`
- `StatusLabel`
- `StatusVariant`
- `StrategicEmphasis`
- `FreshnessDate`
- `FreshnessSource`
- `MilestonesCompleted`
- `MilestonesTotal`
- `MilestoneSummary`
- `CtaLabel`
- `CtaUrl`
- `ProjectTeamMembers`
- `Audience`
- `StaleAfterDays`
- `PublishStart`
- `PublishEnd`

## Hard gates

- UI development must be governed by the SPFx homepage UI doctrine.
- Repo truth is authoritative.
- The list-backed model is the intended operating model.
- The surface must remain a premium project-storytelling module rather than drift into dashboard behavior.
- The featured item must remain first and dominant.
- The team strip must remain integrated into the featured story surface.

## Expected outcome

After completion, the Project Spotlight webpart should:

- source its content from the SharePoint list as intended,
- preserve editorial ranking and visibility logic,
- suppress broken media states with designed fallbacks,
- read as a true flagship story module at desktop,
- provide a more premium supporting rail and team interaction layer,
- and remain responsive, accessible, and package-safe.

# Prompt-06-Recompose-Sparse-Wide-and-Ultrawide-Grid-Behavior

## Objective

Redesign sparse desktop and ultrawide result states so Project Sites uses the available canvas deliberately instead of leaving a timid, left-anchored island of cards.

## Governing authorities

- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- refreshed Project Sites breakpoint contract from Prompt 01

## Exact repo files / seams / symbols to inspect

- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `grid`
  - `gridModeWide`
  - `gridModeMedium`
  - `gridSparse`
  - `visibleCount`
  - `isSparse`
  - any wrapper or layout helpers directly affecting sparse states
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
  - if card presentation must adjust in sparse featured states
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`

## Current gap to close

The current sparse-state behavior keeps the layout safe, but on desktop and ultrawide it still looks under-composed. Cards are bounded, yet the surface does not intentionally use the surrounding canvas.

## Required implementation outcome

Create a clearer sparse-state composition for wide and ultrawide conditions. This can be done through centered sparse clusters, featured leading cards, bounded rails, or another disciplined approach, but the outcome must feel intentional and premium.

The result should also improve broad wide-state composition generally, not only the exact one-card case.

## Proof of closure required

- one- and two-card wide states no longer read as small left-anchored islands
- the sparse-state strategy is visible in code and compatible with the responsive contract
- wide and ultrawide behavior feel more deliberate without adding fake shell chrome
- tests or deterministic assertions cover the new sparse-state contract where practical

## Constraints

- do not solve this with decorative filler or unnecessary visual noise
- do not break normal dense-result grid behavior while fixing sparse states
- do not introduce fragile hardcoded widths that only look good in one screenshot

## Context retention directive

Do not re-read files that are already in your active context unless you need to confirm drift, dependencies, or uncertainty after making changes.

## Local code agent prompt

```text
Objective:
Redesign sparse desktop and ultrawide result states so Project Sites uses the available canvas deliberately instead of leaving a timid, left-anchored island of cards.

Governing Authorities:
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- refreshed Project Sites breakpoint contract from Prompt 01

Exact Repo Files / Seams / Symbols to Inspect:
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `grid`
  - `gridModeWide`
  - `gridModeMedium`
  - `gridSparse`
  - `visibleCount`
  - `isSparse`
  - any wrapper or layout helpers directly affecting sparse states
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`
  - if card presentation must adjust in sparse featured states
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.test.tsx`

Current Gap:
The current sparse-state behavior keeps the layout safe, but on desktop and ultrawide it still looks under-composed. Cards are bounded, yet the surface does not intentionally use the surrounding canvas.

Required Outcome:
Create a clearer sparse-state composition for wide and ultrawide conditions. This can be done through centered sparse clusters, featured leading cards, bounded rails, or another disciplined approach, but the outcome must feel intentional and premium.

The result should also improve broad wide-state composition generally, not only the exact one-card case.

Proof of Closure:
- one- and two-card wide states no longer read as small left-anchored islands
- the sparse-state strategy is visible in code and compatible with the responsive contract
- wide and ultrawide behavior feel more deliberate without adding fake shell chrome
- tests or deterministic assertions cover the new sparse-state contract where practical

Constraints:
- do not solve this with decorative filler or unnecessary visual noise
- do not break normal dense-result grid behavior while fixing sparse states
- do not introduce fragile hardcoded widths that only look good in one screenshot

Special Instruction:
Do not re-read files already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

Execution Notes:
- Treat this as a composition problem, not only a CSS-grid parameter problem.
- Preserve host awareness and avoid turning the surface into a fake application shell.
```

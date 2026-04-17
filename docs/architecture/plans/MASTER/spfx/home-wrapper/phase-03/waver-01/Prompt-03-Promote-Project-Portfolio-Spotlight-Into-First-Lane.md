# Prompt 03 — Promote Project Portfolio Spotlight into the flagship first lane

## Objective
Correct the current composition-policy mismatch that leaves `ProjectPortfolioSpotlight` out of the flagship first-lane eligibility set, despite its role as the strongest operational homepage anchor.

## Governing authority
- `docs/reference/shell/HB-Shell-Entry-Breakpoint-Spec.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Homepage-Overlay.md`
- `docs/architecture/plans/MASTER/spfx/benchmark/README.md`

## Inspect these files first
- `apps/hb-webparts/src/webparts/hbHomepage/shell/occupantRegistry.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/defaultPreset.ts`
- `apps/hb-webparts/src/webparts/hbHomepage/shell/presetLibrary.ts`
- `apps/hb-webparts/src/webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.tsx`
- `apps/hb-webparts/src/webparts/companyPulse/CompanyPulse.tsx`
- `apps/hb-webparts/src/webparts/leadershipMessage/LeadershipMessage.tsx`

Do not re-read files that are still in active context unless you need to confirm drift, dependencies, or uncertainty after changes.

## Current gap
The shell now has real preset and occupancy infrastructure, but its current first-lane assumptions still over-weight historical sequencing. Operational value should lead the shell more decisively.

## Required implementation outcome
- make `project-portfolio-spotlight` eligible for first-lane participation
- add or update the default flagship preset so Spotlight can anchor the first lane
- define whether Company Pulse or Leadership Message is the correct supporting pair, and justify it in code comments or docs
- preserve protected decisions such as recognition ceiling and incompatible pairings

## Closure proof required
Provide:
- changed preset/registry diff summary
- explicit statement of the new first-lane policy
- any validation updates required by the new arrangement

## Prohibited
- no ad hoc one-off JSX ordering hacks
- no unrelated module internals changes

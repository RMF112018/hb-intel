# Prompt-04 — Rework Browse Authority, Year Gating, and Fallback-Inclusive Empty Paths

## Objective

Make browse authority, available-year behavior, and empty-path gating reflect merged-source inventory instead of remaining Projects-only.

## Why this issue exists

Even if the resolver is corrected, the current surface can still suppress fallback-only inventory earlier in the flow because available years and initial scope resolution still derive only from the `Projects` list.

## Current repo-truth condition

`fetchDistinctYears()` reads only `Projects`. `useAvailableYears()` and `ProjectSitesRoot.tsx` use that authority to initialize scope and render empty-state decisions. That means fallback-only inventory can remain unreachable at the browse layer.

## Required future state

Available years and browse gating must become fallback-inclusive where repo truth supports it, without turning the surface into an unbounded or confusing inventory browser.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/types.ts`

## Implementation requirements

- Rework distinct-year authority so fallback-inclusive inventory can participate.
- Audit initial scope resolution and root empty-path gating.
- Keep the behavior deterministic and bounded.
- Preserve current UX discipline unless repo truth requires a specific change.
- Do not leave fallback-only years unreachable simply because `Projects` returned zero rows first.

## Validation and proof-of-closure requirements

- A fallback-only year can be surfaced intentionally when merged-source inventory supports it.
- Root gating no longer suppresses valid fallback-inclusive inventory paths.
- Year/scope behavior remains understandable and stable.

## Deliverables / closure artifacts

- Updated browse-authority logic
- Any required root-state changes closely tied to that authority shift

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.

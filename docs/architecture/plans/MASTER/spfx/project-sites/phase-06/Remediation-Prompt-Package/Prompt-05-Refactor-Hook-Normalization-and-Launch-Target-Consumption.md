# Prompt-05 — Refactor Hook, Normalization, and Launch-Target Consumption

## Objective

Refactor the query hook and normalization path so they consume the authoritative merged contract cleanly instead of perpetuating Projects-origin assumptions.

## Why this issue exists

Once a resolver exists, the hook and normalizer should not remain shaped like “project rows plus enrichment.” Leaving them in that posture creates hidden secondary merge logic and weakens maintainability.

## Current repo-truth condition

`useProjectSites.ts` still frames itself as loading project sites from the Projects list and normalizes repository output with `normalizeProjectSiteEntries`. `normalizeProjectSiteEntry.ts` still assumes project-origin raw rows and derives resolved `siteUrl` from that shape.

## Required future state

The hook should consume an authoritative merged-record input, normalization should be limited to true normalization responsibilities, and launch-target consumption should stay explicit and deterministic downstream.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/projectSiteLaunchState.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`

## Implementation requirements

- Audit whether `normalizeProjectSiteEntry.ts` should be adapted, narrowed, or partially replaced once a merged resolver exists.
- Ensure the hook consumes the authoritative merged output rather than reconstructing source meaning.
- Keep launch-state derivation downstream and truthful.
- Remove or update comments that materially misdescribe the hook/normalization flow as Projects-list-only if they are touched here as part of code truth.

## Validation and proof-of-closure requirements

- The hook returns genuine merged records.
- No hidden second resolver exists in the hook/root layer.
- Launch-target behavior remains deterministic and preserves working legacy-launch behavior.

## Deliverables / closure artifacts

- Updated hook/normalization flow
- Any necessary helper seams
- No unrelated UI redesign

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.

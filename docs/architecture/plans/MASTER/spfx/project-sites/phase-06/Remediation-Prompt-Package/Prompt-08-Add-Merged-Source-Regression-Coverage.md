# Prompt-08 — Add Merged-Source Regression Coverage

## Objective

Add the regression coverage required to prove the merged-source bridge actually works and stays closed.

## Why this issue exists

The current tests prove pieces of the surface, but they do not prove the real bridge cases: fallback-only visibility, approved-linkage precedence, stable merged identity, fallback-inclusive year authority, and truthful root-state behavior.

## Current repo-truth condition

Existing tests cover narrow legacy launch behavior, general filter/sort behavior, and card rendering, but there is no direct resolver test suite and no merged-source closure matrix.

## Required future state

The repo must contain focused tests that fail when the merged-source bridge regresses in the cases that actually matter.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.test.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.test.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.test.tsx`
- new resolver/repository tests under `packages/spfx/src/webparts/projectSites/**`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx` tests if the repo already supports testing that seam cleanly

## Implementation requirements

- Add direct tests for:
  - project-only records
  - merged records
  - legacy-only synthetic records
  - approved-linkage precedence
  - duplicate suppression
  - fallback-inclusive year availability
  - truthful root empty/error/context behavior where practical
  - source-aware filtering/search if implemented
- Prefer direct resolver tests over indirect UI-only coverage.
- Keep fixtures readable and source-explicit.

## Validation and proof-of-closure requirements

- Tests fail if fallback-only records disappear.
- Tests fail if merged duplicates reappear.
- Tests fail if approved linkage stops winning where expected.
- Tests fail if root truthfulness regresses materially.

## Deliverables / closure artifacts

- New/updated test files
- Any fixture builders/helpers justified by the new coverage

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.

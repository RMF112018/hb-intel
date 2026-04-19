# Prompt-06 — Add Source-Aware Filtering, Search, and Facets

## Objective

Extend the client-side pipeline so users can intentionally reason over modern, merged, and legacy-backed inventory during the migration period without cluttering the experience.

## Why this issue exists

Once merged-source records exist, the current filter/search model is under-modeled. It can search natural fields, but it cannot intentionally expose source-backed inventory states.

## Current repo-truth condition

`projectSitesFilter.ts` builds a natural-field corpus and supports multi-select filters plus `hasSiteOnly`, but there is no source-aware filter dimension and no source-aware facet extraction.

## Required future state

The filter/search/facet seam should remain compact and pure, but it should gain a restrained source-aware dimension grounded in the merged contract.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`

## Implementation requirements

- Add a bounded source-aware filter/facet model if repo truth supports it.
- Keep the pipeline pure and derived.
- Do not overexpose support/admin detail in the main user workflow.
- Ensure search corpus and filters cooperate with the merged contract instead of depending on ad hoc field presence.

## Validation and proof-of-closure requirements

- Users can intentionally inspect legacy-backed inventory when needed.
- The UI remains disciplined and operational rather than noisy.
- Existing search/sort/filter behavior for non-source fields does not regress.

## Deliverables / closure artifacts

- Updated filter model
- Updated pipeline and facet extraction
- Root integration changes only as required

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.

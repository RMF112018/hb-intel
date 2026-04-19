# Prompt-03 — Implement Merged Resolver and Synthetic Legacy-Only Emission

## Objective

Replace the current repository-local enrichment pattern with a dedicated merged-source resolver that deterministically emits project-only, merged, and synthetic legacy-only records.

## Why this issue exists

The current code decorates only existing project rows. That blocks fallback-only visibility and leaves precedence, duplicate suppression, and linkage reasoning buried in repository helpers rather than owned by a first-class resolver seam.

## Current repo-truth condition

`buildLegacyFallbackLookup(...)` and `applyFallbackLookup(...)` in `projectSitesRepository.ts` decorate `Projects` rows. `fetchProjectSites(scope)` returns early when no project rows exist. Lookup authority is still largely `projectNumber::legacyYear`. There is no explicit emitted-record resolver.

## Required future state

A dedicated resolver seam must merge project rows and fallback rows into one authoritative record set, emit synthetic legacy-only entries when allowed, prefer stronger approved linkage where present, and suppress duplicates deterministically.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- new resolver seam under `packages/spfx/src/webparts/projectSites/**`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts` or successor seam if touched

## Implementation requirements

- Add a dedicated resolver helper/module with direct unit-testability.
- Centralize:
  - source matching
  - approved-linkage preference
  - fallback heuristic fallback rules
  - source classification
  - synthetic legacy-only emission
  - duplicate suppression
  - resolved launch-target selection
- Do not leave merged-source authority spread across repository, hook, and root UI.
- Keep the output deterministic and explainable.
- Preserve existing correct primary-vs-fallback launch precedence.

## Validation and proof-of-closure requirements

- A fallback-only approved record becomes visible even when there is no matching `Projects` row.
- A merged project renders once, not twice.
- Stronger approved linkage can outrank weaker heuristic joins where such fields are present.
- Resolver behavior is directly testable without mounting the root UI.

## Deliverables / closure artifacts

- New resolver seam
- Repository updated to use it
- Any required merge-rule notes if repo practice prefers a short closure explanation

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.

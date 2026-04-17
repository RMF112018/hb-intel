# Prompt-02-Stabilize-Repository-Adapter-and-Field-Contract.md

## Objective
Upgrade the Project Sites data seam from a transitional defensive fetch model into a canonical repository adapter that is explicit, typed, and trustworthy enough for a premium launch surface.

## Governing authorities
- `docs/reference/ui-kit/doctrine/UI-Doctrine-SPFx-Governing-Standard.md`
- `docs/architecture/reviews/spfx/project-sites/project-sites-search-filter-sort-enhancement.md`
- current Project Sites source of truth under `packages/spfx/src/webparts/projectSites/`

## Inspect these exact repo seams
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`
- related tests for hooks, types, and normalization

## Current future-state gap to close
The current implementation fetches full raw list items with no `$select` and normalizes them defensively because the underlying schema used mixed legacy field names. That was a reasonable stabilization step, but it is not the right long-term authority model for a product whose value depends on users trusting what they can launch.

## Required implementation outcome
Implement a stronger canonical adapter. At minimum:

1. Formalize the final Project Sites record contract around explicitly selected / expected fields.
2. Refactor the repository seam so query logic is centralized and intentionally typed.
3. Preserve backward-compatible normalization only where still required by real schema drift.
4. Add explicit classification for malformed or missing launch-critical data instead of silently coercing everything into display values.
5. Keep the current client-side search/filter/sort pipeline unless you have to move a specific responsibility downward for correctness.
6. Revisit the `All Projects` strategy so it stays bounded and credible without relying on a vague full-row fetch forever.

## Closure proof required
- show the new repository / adapter boundary
- show the explicit field contract and how it maps to the normalized UI record
- show updated tests covering malformed / partial record cases
- explain why the final adapter is safer than the current no-`$select` transitional pattern

## Guardrails
- do not add speculative infrastructure that is not needed for this surface
- do not rewrite the pure pipeline unless correctness requires it
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes

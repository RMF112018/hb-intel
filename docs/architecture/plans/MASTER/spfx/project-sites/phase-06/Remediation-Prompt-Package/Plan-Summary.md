# Plan Summary

## Objective

Complete the `project-sites` legacy fallback lane by converting the current `Projects`-first enrichment implementation into a closure-ready merged-source access surface that can truthfully represent:

- project-only records
- merged project + legacy records
- synthetic legacy-only records

## Starting repo-truth condition

The live repo already has:
- fallback registry reads in `projectSitesRepository.ts`
- fallback-aware fields in `types.ts`
- fallback-aware normalization in `normalizeProjectSiteEntry.ts`
- legacy-aware launch-state logic in `projectSiteLaunchState.ts`
- truthful legacy launch labels in `ProjectSiteCard.tsx`

The live repo does **not** yet have:
- fallback-only visible emission
- stable merged record identity
- approved-linkage-aware resolver precedence
- fallback-inclusive browse authority
- source-aware filtering/search
- merged-source closure proofs

## Non-negotiable closure standard

The work is not complete until all of the following are true:

- approved fallback-only records can surface as cards
- merged and legacy-only entries have stable unique keys
- approved linkage can outrank weaker heuristic joins where repo truth supports it
- year/scope authority can represent fallback-inclusive inventory
- empty/error/context copy is truthful for a merged-source surface
- regression coverage proves the bridge in the real cases that matter

## Dependency posture

No new runtime dependency is expected to be necessary for this lane.

## Execution rules for every prompt

- conduct an exhaustive scrub of the affected seam before changing code
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes
- make no unrelated changes
- prove closure before moving to the next prompt

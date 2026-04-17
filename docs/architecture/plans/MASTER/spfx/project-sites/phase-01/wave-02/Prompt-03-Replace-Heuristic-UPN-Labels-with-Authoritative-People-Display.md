# Prompt-03-Replace-Heuristic-UPN-Labels-with-Authoritative-People-Display.md

## Objective
Upgrade Project Sites from heuristic UPN humanization to a more authoritative people-display model where feasible, while keeping the experience performant and low-friction.

## Governing authorities
- current Project Sites source under `packages/spfx/src/webparts/projectSites/`
- the future-state audit findings

## Inspect these exact repo seams
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- any people / SPFx helper seams already available in the repo
- relevant tests

## Current future-state gap to close
`humanizeUpn()` is useful as a fallback, but it is not authoritative. For a premium launch surface, people labels should not look approximate when better information is available.

## Required implementation outcome
1. Introduce a deliberate people-display resolution seam.
2. Use authoritative display labels when feasible.
3. Preserve heuristic fallback only as a true fallback path.
4. Ensure filter facets, chips, and card-level people labels stay consistent.

## Closure proof required
- show the final people-label resolution strategy
- show fallback behavior when authoritative labels are unavailable
- update tests for both resolved and fallback scenarios

## Guardrails
- do not introduce expensive uncontrolled lookup churn
- do not break the current filter model
- do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes

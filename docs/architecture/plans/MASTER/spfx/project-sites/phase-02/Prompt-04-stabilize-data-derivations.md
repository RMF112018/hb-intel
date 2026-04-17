# Prompt 04 — Stabilize Data Derivations and Reduce Rerender Churn

## Objective
Reduce unnecessary Project Sites rerender churn by stabilizing normalized entry identity and derived list computation.

## Governing Authorities / Relevant Docs
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/projectSitesFilter.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

## Critical Operating Instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Exact Files and Symbols to Inspect
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
  - query config
  - normalization point
- `packages/spfx/src/webparts/projectSites/normalizeProjectSiteEntry.ts`
- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
  - `facets`
  - `visibleEntries`
  - card render path
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx`

## Exact Defect / Instability Issue to Close
Normalized entries are recreated during render, which weakens memoization and causes unnecessary downstream work during UI-only state changes.

## Required Implementation Outcome
Implement a stable derivation path in which:
1. normalization happens once per query-data change, not every root rerender
2. visible-entry computation is memoized against stable upstream inputs
3. cards do not rerender unnecessarily during unrelated UI state changes
4. any memoization added is disciplined and justified, not blanket cargo-culting

Potential acceptable directions include:
- React Query `select`
- `useMemo` keyed on raw query data identity
- `React.memo` for cards after prop identity is stabilized

## Validation / Proof of Closure Requirements
Provide proof for all of the following:
- typing into the search box before debounce expiry does not trigger avoidable full-card churn
- opening/closing the filter panel does not cause unnecessary full-list rerender work
- normalized entry identity remains stable when query data has not changed
- regression tests or render-count instrumentation demonstrate the improvement

## Explicit Non-Goals
- no new feature work
- no business-logic changes to how fields are interpreted

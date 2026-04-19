# Prompt-09 — Refresh Comments, Docs, and Architecture Notes

## Objective

Refresh code comments and adjacent architecture notes so maintainers understand the closed lane as a merged-source access surface rather than a Projects-only browser with enrichment.

## Why this issue exists

Even after code closure, maintainer comprehension will drift if comments and architecture notes continue to describe a one-source mental model.

## Current repo-truth condition

`types.ts`, `useProjectSites.ts`, `useAvailableYears.ts`, and related comments still describe the lane in Projects-list-centric terms. The earlier package bundled this together with user-support copy; that is too vague for clean closure.

## Required future state

Touched comments and nearby repo notes should describe the actual merged-source behavior precisely and briefly.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/types.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- adjacent repo docs only if directly affected and justified by repo practice

## Implementation requirements

- Refresh only the comments/docs that materially misdescribe behavior.
- Keep wording disciplined and implementation-truthful.
- Do not rewrite broad documentation surfaces unrelated to this lane.
- Cross-check against the phase-04 bridge spec only where that helps keep wording aligned with actual code truth.

## Validation and proof-of-closure requirements

- A maintainer reading the touched seams understands the lane as merged-source access, not as a simple Projects-list browser.
- No key touched comment materially contradicts the landed code behavior.

## Deliverables / closure artifacts

- Refreshed comments
- Any narrowly relevant architecture-note update if repo practice requires it

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.

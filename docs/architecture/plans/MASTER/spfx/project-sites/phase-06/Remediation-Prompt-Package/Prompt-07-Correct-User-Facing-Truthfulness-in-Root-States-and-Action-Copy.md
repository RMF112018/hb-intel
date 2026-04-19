# Prompt-07 — Correct User-Facing Truthfulness in Root States and Action Copy

## Objective

Correct user-facing empty, error, and context messaging so the root surface truthfully describes a merged-source access layer rather than continuing to describe a Projects-only browser.

## Why this issue exists

The current earlier package treated user-support copy and code-comment refresh as one late-stage cleanup area. That is too weak. `ProjectSitesRoot.tsx` currently contains user-visible language that will remain materially misleading after the bridge closes unless corrected intentionally.

## Current repo-truth condition

`ProjectSitesRoot.tsx`, `useAvailableYears.ts`, and `useProjectSites.ts` still refer in user-visible or near-user-visible terms to loading or returning entries “from the Projects list.” That framing is false for a merged-source surface.

## Required future state

Root-surface messages must describe the actual merged-source truth clearly and calmly. They should remain compact, operational, and non-speculative.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/ProjectSitesRoot.tsx`
- `packages/spfx/src/webparts/projectSites/hooks/useAvailableYears.ts`
- `packages/spfx/src/webparts/projectSites/hooks/useProjectSites.ts`
- `packages/spfx/src/webparts/projectSites/components/ProjectSiteCard.tsx` (only if action/support wording changes are justified)

## Implementation requirements

- Audit all user-facing empty/error/context strings in the root surface.
- Correct any copy that falsely describes the result as Projects-only.
- Keep launch action labels truthful and compact.
- Do not turn this into a broad tone-polish exercise; this is truthfulness work tied to architecture closure.

## Validation and proof-of-closure requirements

- Fallback-inclusive states do not tell the user that the result came only from the `Projects` list.
- Launch labels remain concise and truthful.
- Messages remain calm, factual, and operational.

## Deliverables / closure artifacts

- Updated user-facing copy in touched seams
- No broad unrelated copy rewrite

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.

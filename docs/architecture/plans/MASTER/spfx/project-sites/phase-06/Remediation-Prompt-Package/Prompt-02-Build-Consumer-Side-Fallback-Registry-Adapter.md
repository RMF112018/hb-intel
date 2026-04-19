# Prompt-02 — Build Consumer-Side Fallback Registry Adapter

## Objective

Build an explicit consumer-side adapter/descriptor seam for fallback registry rows so the resolver consumes an intentional contract instead of an ad hoc thin subset hidden inside the repository method.

## Why this issue exists

The backend registry descriptor is richer than the current SPFx consumer read shape. The current repository directly selects a narrow subset of fields inline, which makes the consumer weaker than the governed registry and obscures what data the resolver is actually allowed to depend on.

## Current repo-truth condition

`projectSitesRepository.ts` selects only a small field subset from `Legacy Project Fallback Registry`, even though the governed descriptor already includes richer fields such as `MatchedProjectListItemId`, `MatchConfidence`, and `MatchMethod`. There is no clearly named consumer adapter seam.

## Required future state

The consumer should have a clear, narrow, intentional adapter for fallback registry rows, including the stronger linkage/provenance fields the resolver truly needs and nothing casual beyond that.

## Files and code paths to inspect

- `packages/spfx/src/webparts/projectSites/repository/projectSitesRepository.ts`
- `packages/spfx/src/webparts/projectSites/types.ts`
- `backend/functions/src/services/legacy-fallback/list-descriptors.ts` (authority check only)
- new consumer-side adapter/descriptor seam under `packages/spfx/src/webparts/projectSites/**` if justified

## Implementation requirements

- Create a clearly named consumer-side fallback row type / descriptor / mapper seam.
- Include stronger approved-linkage fields where they materially improve resolver authority.
- Keep the adapter narrow and explicit; do not mirror the full backend descriptor unless actually required.
- Remove magic inline field-subset assumptions from repository logic where appropriate.
- Preserve the distinction between backend descriptor authority and consumer-side needs.

## Validation and proof-of-closure requirements

- Resolver-facing fallback rows are intentionally modeled, not implicit.
- Stronger linkage fields are available to the consumer when justified.
- No unrelated registry concerns are pulled into the SPFx lane unnecessarily.

## Deliverables / closure artifacts

- New or refreshed adapter/descriptor seam
- Updated repository imports/use sites
- Inline comments only where they materially clarify field intent

## Constraints

- Work against the live local repo.
- Do not re-read files already in active context unless needed to confirm drift, dependencies, or uncertainty after changes.
- Do not make unrelated changes.
- Do not add a new runtime dependency unless repo truth proves it is required. None is expected to be required for this lane.
- Preserve the existing package/runtime ownership model unless repo truth proves a required seam move.

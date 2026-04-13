# 08 — Prompt — Phase 2 — Rebase Kudos Readers/Writers onto the Platform Layer

## Objective
Rewire the HB Kudos data seams to consume the newly extracted shared SharePoint platform package, while preserving current runtime behavior.

## Repo authority
Use the live `main` branch of:
- `https://github.com/RMF112018/hb-intel.git`

## Required instruction
Do not re-read files that are already in your active context unless needed to confirm drift, dependencies, or uncertainty after changes.

## Scope
Refactor the current Kudos data seams so that low-level mechanics are no longer owned by product-facing modules.

## File focus
At minimum inspect:
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureListSource.ts`

## Mandatory outcomes
- `fetchRequestDigest()` no longer lives only as a submission-source mechanic
- ensure-user/current-user resolution no longer depends on product-facing ownership
- ETag/MERGE helpers are routed through the platform layer
- cache invalidation uses the explicit extracted primitive
- people search consumes the neutral platform helper path

## Hard rules
- Preserve GUID-safe binding.
- Preserve canonical host behavior.
- Preserve audit-event guarantee in governance actions.
- Preserve post-mutation refresh behavior.
- Do not flatten Kudos domain logic into the platform layer.

## Required scrubbing
Search exhaustively for:
- duplicated digest helpers
- duplicated current-user helpers
- direct MERGE write implementations
- direct item-meta lookup implementations
- stale imports from pre-extraction modules

Close every affected seam completely before ending the phase.

## Required validation
- unit tests updated for changed helpers
- reader/writer tests pass
- no orphaned duplicated helper remains in the app
- no regression in submission, governance, or people-search paths

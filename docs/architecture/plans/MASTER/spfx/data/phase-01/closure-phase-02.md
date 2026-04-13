# Phase 02 — Closure Note — Rebase Kudos Readers/Writers

## What was rewired
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts` — removed the Phase-01 re-export shims for `fetchRequestDigest` and `resolveUserId`. Internal call sites now call `fetchRequestDigest` / `ensureUserByEmail` directly from `@hbc/sharepoint-platform`.
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts` — imports `fetchRequestDigest` and `ensureUserByEmail` directly from `@hbc/sharepoint-platform` (previously via `peopleCultureSubmissionSource`); renamed `resolveUserId` call site to `ensureUserByEmail`.
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts` — re-pointed `fetchRequestDigest` import to the platform package.
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts` — replaced the module-level `_cacheGeneration` counter with `createCacheInvalidationBus()` from `@hbc/sharepoint-platform`. Public `invalidatePeopleCultureCache` name and 5-minute TTL behavior preserved; hook subscribes via `useEffect` instead of polling.

## Duplicates removed
- Orphaned `fetchRequestDigest` and `resolveUserId` wrapper functions in `peopleCultureSubmissionSource.ts`.
- Cross-module `peopleCultureSubmissionSource` import edge from `kudosGovernanceWriter` and `useSharePointPeopleSearch`.

## What did not move (Kudos domain stays app-local)
- `kudosRoleResolver.ts` still issues `/_api/web/currentuser?$expand=Groups` — this is a Kudos-specific role/group resolution query, not a generic platform mechanic.
- `patchKudosItem` / `fetchKudosItemMeta` in `kudosGovernanceWriter.ts` — Kudos-domain wrappers over platform primitives; they call `mergeItemById` / `fetchItemMetaByFieldValue` internally.
- Kudos submission payload construction, audit-event writes, and governance patch plan — all Kudos domain logic.

## Invariants preserved
- GUID-safe list binding via `PEOPLE_CULTURE_LIST_REGISTRY`.
- Canonical `KUDOS_LIST_HOST_URL` host resolution.
- Audit-event writes on every governance transition.
- Post-mutation cache invalidation (now via the extracted bus).

## Verification
| Command | Result |
|---|---|
| `pnpm --filter @hbc/sharepoint-platform build` | pass |
| `pnpm --filter @hbc/sharepoint-platform test` | 30/30 pass |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | pass |
| `pnpm --filter @hbc/spfx-hb-webparts test` | 459 pass / 17 fail — identical to Phase-01 baseline, all pre-existing and unrelated to SP data modules |

Scrub (`grep` over `apps/hb-webparts/src`):
- `_api/contextinfo`, `X-HTTP-Method`, `_api/web/ensureuser`: zero matches outside comments / test mocks / Kudos-domain helpers.
- `fetchRequestDigest` / `ensureUserByEmail`: all imports resolve to `@hbc/sharepoint-platform`.

## Manifest
- `apps/hb-webparts/config/package-solution.json` feature version `1.0.0.186` → `1.0.0.187`.
- Solution version unchanged at `1.0.0.189`.

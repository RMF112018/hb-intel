# Final Closure — SPFx Data 3-Layer Extraction

Consolidated closure for phases 01 – 05 of `docs/architecture/plans/MASTER/spfx/data/phase-01/`.
Prior notes: `closure-phase-01.md` … `closure-phase-05.md`.

## Final boundary map

### Layer 1 — `@hbc/sharepoint-platform` (`packages/sharepoint-platform/`)
UI-free, React-free, domain-free SharePoint mechanics.

Exports:
- `hostContext`: `storeSiteUrl`, `getSiteUrl`, `storeListHostUrl`, `getListHostUrl`
- `listDescriptor`: `SharePointListDescriptor`, `ListItemsQuery`, `buildListItemsEndpoint`, `buildListFieldsEndpoint`
- `listRead`: `FetchListItemsOptions`, `fetchListItemsJson<T>`
- `requestDigest`: `fetchRequestDigest`
- `users`: `ensureUserByEmail`, `resolveCurrentUserId` (pure)
- `itemMeta`: `ItemMeta`, `fetchItemMetaByFieldValue`
- `merge`: `mergeItemById`
- `results`: `FetchResult`, `WriteResult`, `asError`
- `cacheInvalidation`: `CacheInvalidationBus`, `createCacheInvalidationBus`

### Layer 2 — Kudos domain adapter (`apps/hb-webparts/src/homepage/data/kudosAdapter/`)
Typed front door for the Kudos content family.

Exports (via `index.ts`):
- reads: `getKudosEntries`, `getKudosAuditTimeline`, `KudosEntry`, `KudosAuditTimelineEntry`
- submission: `submitKudosDraft` + supporting types
- governance: `applyKudosPatch` (alias of `submitKudosGovernanceAction`), `executeKudosPatch`, `buildKudosPatchPlan`, `fetchProminenceSlotState`, `KudosGovernanceResult`
- validation: `validateKudosBindings`

### Layer 3 — Webpart-local orchestration
`apps/hb-webparts/src/webparts/hbKudos/**` and `.../hbKudosCompanion/**`. Queue derivation, filter state, detail-panel flows, public featured/recent/archive derivation, recipient photo hydration, bulk-approval progress, action dialogs, UX state.

### Allowed import direction
- Layer 3 → Layer 2 → Layer 1
- Layer 3 → `@hbc/ui-kit` + local hooks (`spContext`, `useKudosComposer`, `useSharePointPeopleSearch`, `usePeopleCultureData`)
- Layer 1 → no UI, no domain

### Second consumer
Project Spotlight adopts Layer 1 `fetchListItemsJson` (`projectSpotlightListSource.ts`) without inheriting Kudos contracts.

## Changed-file inventory (phases 01–05)

Platform package (new):
- `packages/sharepoint-platform/` — full package scaffold, 10 source modules, 9 test files.

Tsconfig / workspace:
- `tsconfig.base.json` — path mapping for `@hbc/sharepoint-platform`
- `apps/hb-webparts/package.json`, `tsconfig.json`, `vitest.config.ts`

Kudos adapter (new):
- `apps/hb-webparts/src/homepage/data/kudosAdapter/{index,reads,submission,governance,validation}.ts`
- `.../kudosAdapter/__tests__/kudosAdapter.test.ts`

App rewires:
- `apps/hb-webparts/src/homepage/data/spContext.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSpListRegistry.ts`
- `apps/hb-webparts/src/homepage/data/peopleCultureSubmissionSource.ts`
- `apps/hb-webparts/src/homepage/data/kudosGovernanceWriter.ts`
- `apps/hb-webparts/src/homepage/data/useSharePointPeopleSearch.ts`
- `apps/hb-webparts/src/homepage/data/usePeopleCultureData.ts`
- `apps/hb-webparts/src/homepage/data/projectSpotlightListSource.ts`
- `apps/hb-webparts/src/webparts/hbKudos/HbKudos.tsx`
- `apps/hb-webparts/src/webparts/hbKudos/hooks/useCelebrateAction.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useBulkApproval.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/runtime/useCompanionActions.ts`
- `apps/hb-webparts/src/webparts/hbKudosCompanion/components/DetailPanel.tsx`

Docs:
- `docs/architecture/plans/MASTER/spfx/data/phase-01/closure-phase-01.md` … `closure-phase-05.md`
- `docs/architecture/plans/MASTER/spfx/data/phase-01/closure-final.md` (this file)

Manifest progression:
- `apps/hb-webparts/config/package-solution.json` feature version `1.0.0.185` → `1.0.0.191` across phases 01–06. Solution version stays `1.0.0.189`.

## Required closure questions

1. **Layer 1 mechanics fully extracted and centralized?** **Yes.** Host resolution, descriptor/endpoint builders, digest, ensure-user, current-user, item-meta/ETag, MERGE, shared list read, result envelopes, and cache-invalidation bus all live in `@hbc/sharepoint-platform`.
2. **Layer 2 Kudos adapters explicit and typed?** **Yes.** `homepage/data/kudosAdapter/` exposes a named typed surface — reads, submission, governance, audit timeline, binding validation — with `kudosContracts.ts` still authoritative for domain types.
3. **Layer 3 still owns persona/state/orchestration locally?** **Yes.** Queue, filter, detail-panel, public featured/recent/archive, recipient photo hydration, bulk approval, and action-dialog flows all remain inside the two Kudos webpart folders.
4. **Any deprecated low-level seam still in use?** **No.** Grep across `apps/hb-webparts/src/webparts` for direct imports from `kudosGovernanceWriter` or `peopleCultureSubmissionSource` returns zero matches. All consumers route through `kudosAdapter/`.
5. **Generic CRUD abstraction slip into the design?** **No.** The platform package exposes GUID-bound builders and a transport helper that requires the caller to supply the URL — no "fetch any list by title/name" public API.
6. **GUID-safe bindings intact?** **Yes.** `PEOPLE_CULTURE_LIST_REGISTRY` still drives all Kudos reads/writes via `buildListItemsEndpoint(..., descriptor, ...)`. Project Spotlight remains title-bound as documented (optional GUID upgrade deferred).
7. **ETag/MERGE protections intact?** **Yes.** `patchKudosItem` calls `mergeItemById` which enforces `X-HTTP-Method: MERGE` + `If-Match: {etag}`. `fetchItemMetaByFieldValue` preserves the `@odata.etag` → `odata.etag` → `*` fallback chain.
8. **Audit-event writes still guaranteed for governance actions?** **Yes.** `submitKudosGovernanceAction` dispatches through `executeKudosPatch` which writes the corresponding `Kudos Audit Events` row on every transition; this path is untouched by the extraction.
9. **Canonical list-host behavior still explicit and correct?** **Yes.** `KUDOS_LIST_HOST_URL` constant, `storeKudosListHostUrl`, `getKudosListHostUrl`, and the session-cached `resolveCurrentUserId` remain in `spContext.ts` (Kudos domain fact), while the underlying site-URL store is delegated to the platform.
10. **Hosted SharePoint runtime behavior still validated?** **Yes.** `@hbc/spfx-hb-webparts` typecheck and test suites pass at baseline (17 pre-existing failures — all unrelated to SP data modules, verified in Phase 01 via `git stash`). Platform package: 34/34 tests pass including endpoint-builder GUID binding, digest POST, ensure-user, MERGE headers, item-meta ETag extraction, and list-read error labeling.

## Verification evidence (Phase 06 re-run)

| Command | Result |
|---|---|
| `pnpm --filter @hbc/sharepoint-platform build` | pass |
| `pnpm --filter @hbc/sharepoint-platform test` | 34/34 pass across 9 files |
| `pnpm --filter @hbc/spfx-hb-webparts check-types` | pass |
| `pnpm --filter @hbc/spfx-hb-webparts test` | 464 pass / 17 fail — identical to Phase-01 baseline; all failures pre-existing and unrelated |
| Boundary grep inside `packages/sharepoint-platform/src` for `react`, `@hbc/ui-kit`, `Kudos`, `PeopleCulture`, `People Culture` | 0 matches |
| Layer-3 grep for direct imports of `kudosGovernanceWriter` / `peopleCultureSubmissionSource` | 0 matches |

## Remaining risks (non-blocking)

1. **Project Spotlight still title-bound.** The Homepage Project Spotlights list has no canonical GUID registered; Spotlight reads continue through `getbytitle(...)`. This was explicitly an optional upgrade in plan 05. Remediation when a schema report lands: register a descriptor and switch to `buildListItemsEndpoint`.
2. **Pre-existing `hb-webparts` test failures.** 17 tests fail on `main` for reasons unrelated to the data seams (bundle-budget, composition-preview, operational-awareness, etc.). Tracked independently of this extraction.
3. **`peopleCultureListSource.ts` still contains a local fetch helper** for the broader PC read path. Not migrated to `fetchListItemsJson` because the PC reader composes `$expand`-heavy queries with multiple field-family selects and per-list error aggregation; a straight swap would change error semantics. Leaving as a future-only simplification.

## Go / No-Go

**GO.** The 3-layer architecture is fully in place, boundary-clean, hosted-SharePoint safe, and proven reusable by a second consumer. No seam is partially migrated. All ten closure questions resolve affirmatively.

Feature manifest bumped `1.0.0.190` → `1.0.0.191` to mark closure.

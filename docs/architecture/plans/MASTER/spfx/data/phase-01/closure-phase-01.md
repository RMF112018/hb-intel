# Phase 01 — Closure Note

**Plan:** `synchronous-weaving-thacker` (Phase 1 of `docs/architecture/plans/MASTER/spfx/data/phase-01/`).
**Outcome:** Layer 1 (shared SharePoint platform mechanics) extracted into the new workspace package `@hbc/sharepoint-platform`. Runtime behavior preserved.

## What moved

Into `packages/sharepoint-platform` (`@hbc/sharepoint-platform`):

- **Host context store** — `storeSiteUrl`, `getSiteUrl`, `storeListHostUrl`, `getListHostUrl` (trailing slashes trimmed; `storeListHostUrl`/`getListHostUrl` is a domain-agnostic override slot).
- **Generic list descriptor & endpoint builders** — `SharePointListDescriptor` interface, `buildListItemsEndpoint`, `buildListFieldsEndpoint` (GUID binding, encoded query strings, `InternalName` select when filtering fields).
- **Request digest** — `fetchRequestDigest(siteUrl)` ported from `peopleCultureSubmissionSource.ts`.
- **Users** — `ensureUserByEmail(siteUrl, email, digest)` (ported from `resolveUserId`), and a pure (non-cached) `resolveCurrentUserId(siteUrl)`.
- **Item meta / ETag** — `fetchItemMetaByFieldValue(siteUrl, descriptor, fieldName, value) → { itemId, etag } | undefined`. Uses `minimalmetadata` Accept; extracts `@odata.etag` → `odata.etag` → `*`; escapes single quotes in filter values.
- **MERGE** — `mergeItemById(siteUrl, descriptor, itemId, etag, digest, fields)` using `POST` + `X-HTTP-Method: MERGE` + `If-Match: {etag}` and `odata=nometadata` JSON headers.
- **Result envelopes** — `FetchResult<T>`, `WriteResult`, `asError`.
- **Cache invalidation primitive** — `createCacheInvalidationBus()` returning `{ invalidate, subscribe, getGeneration }`.

Package scaffold mirrors `packages/sharepoint-docs` conventions (ESM, `tsc` build with `composite: true`, vitest) but deliberately has **zero `@hbc/*` dependencies**, **zero React**, and **zero UI imports**. Only devDeps: `typescript`, `vitest`, `@vitest/coverage-v8`.

Tests live under `packages/sharepoint-platform/src/__tests__/` (8 test files, 30 tests passing) with a shared `setup.ts` installing a `global.fetch` mock helper.

## What did not move (explicitly Phase 1 out-of-scope)

- **`KUDOS_LIST_HOST_URL` and `getKudosListHostUrl`** remain in `apps/hb-webparts/src/homepage/data/spContext.ts`. Kudos-domain fact, not a platform primitive.
- **Session-cached `resolveCurrentUserId()`** stays in `spContext.ts`; it now delegates the HTTP call to the platform's pure `resolveCurrentUserId(siteUrl)` but retains the app-local promise cache keyed on the Kudos list-host URL.
- **`PEOPLE_CULTURE_LIST_REGISTRY`** contents (PC/Kudos list GUIDs, titles, URL segments, critical field lists) stay in `peopleCultureSpListRegistry.ts`. Domain registry. `PeopleCultureListDescriptor` now extends the platform's generic `SharePointListDescriptor` shape.
- **`buildPcListItemsEndpoint` / `buildPcListFieldsEndpoint`** remain as thin app-side adapters over the platform builders; existing callers that pass a `PeopleCultureListKey` are unchanged.
- **Kudos payload construction, audit-event writes, governance patch plan** — Layer 2 Kudos semantics; untouched.
- **`usePeopleCultureData` React hook** — stays in app. The cache-invalidation *primitive* is extracted; the specific PC bus stays app-local because a clean swap was not risk-free within Phase 1 scope (plan explicitly allows leaving this for a later phase).

## Why

Phase 1 is mechanics-only. Kudos domain logic is Layer 2 work deferred to Phases 2/3. Preserving the existing `fetchRequestDigest` / `resolveUserId` export names in `peopleCultureSubmissionSource.ts` as re-exports keeps caller churn out of this phase so the rename can be its own reviewable step.

## App-side rewires

1. `spContext.ts` — `storeSiteUrl`/`getSiteUrl` delegate to platform. `resolveCurrentUserId()` (cached) calls platform's pure variant under the hood.
2. `peopleCultureSpListRegistry.ts` — `PeopleCultureListDescriptor extends SharePointListDescriptor`; builders are thin adapters over the platform's `buildListItemsEndpoint`/`buildListFieldsEndpoint`.
3. `peopleCultureSubmissionSource.ts` — `fetchRequestDigest` and `resolveUserId` are now 1-line delegates to `@hbc/sharepoint-platform`'s `fetchRequestDigest` / `ensureUserByEmail`. Names preserved.
4. `kudosGovernanceWriter.ts` — `fetchKudosItemMeta` rebased onto `fetchItemMetaByFieldValue(... KUDOS_FIELDS.KudosId, kudosId)` with app-side re-attachment of the `kudosId` echo field. `patchKudosItem` rebased onto `mergeItemById`. Local `escapeODataString` retained for the audit-event read path that still builds its own filter.
5. `usePeopleCultureData.ts` — left unchanged this phase (optional per plan).

## Workspace wiring

- `packages/sharepoint-platform/package.json` created; `"type": "module"`, ESM exports.
- `pnpm-workspace.yaml` — no change needed (`packages/*` already included).
- `tsconfig.base.json` — added `@hbc/sharepoint-platform` and `@hbc/sharepoint-platform/*` path mappings.
- `apps/hb-webparts/package.json` — added `"@hbc/sharepoint-platform": "workspace:*"`.
- `apps/hb-webparts/tsconfig.json` — added path mapping.
- `apps/hb-webparts/vitest.config.ts` — added resolve alias.
- `pnpm install` re-run (no new peer warnings introduced by this phase).

## Manifest version

- `apps/hb-webparts/config/package-solution.json` — feature version bumped **`1.0.0.185` → `1.0.0.186`** (no webpart behavior change; patch bump on the 4th segment per plan).
- Solution version left at `1.0.0.189` (no manifest-shape change).

## Verification

- `pnpm --filter @hbc/sharepoint-platform build` — OK.
- `pnpm --filter @hbc/sharepoint-platform test` — **30/30 passing across 8 files**.
- `pnpm --filter @hbc/sharepoint-platform lint` — skipped (no lint script configured for this package; `typescript` + `vitest` are the only dev dependencies, matching the plan).
- `pnpm --filter @hbc/spfx-hb-webparts check-types` — OK (no errors).
- `pnpm --filter @hbc/spfx-hb-webparts test` — **459 passing / 17 failing**. All 17 failures are pre-existing (bundle-budget, composition-preview, discovery/utility webparts, interactive CSS, motion, mountDispatch, operational-awareness, PC public runtime, topBand). Verified identical failure count on `git stash` before my changes. No new regressions.
- Boundary grep over `packages/sharepoint-platform/src` for `react`, `@hbc/ui-kit`, `Kudos`, `PeopleCulture`, `People Culture` — **zero hits**.

## Hard-rules conformance

- No Kudos workflow logic in platform package. ✔
- No React / UI-kit imports in platform package. ✔
- No generic "fetch any list by name" API — all binding is via caller-supplied `SharePointListDescriptor` (GUID). ✔
- GUID binding preserved (no `getbytitle`). ✔
- Runtime behavior preserved (REST verbs, headers, Accept variants, If-Match, encoded query strings, ensureuser conventions all unchanged). ✔

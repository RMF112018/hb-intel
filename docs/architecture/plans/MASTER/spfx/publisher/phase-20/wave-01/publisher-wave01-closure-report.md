# Publisher Wave 01 — Closure Report

**Scope:** `apps/hb-publisher` — supported **Project Spotlight** runtime only.
**Closing package version:** `1.0.0.80` (`apps/hb-publisher/config/package-solution.json`)
**Closing manifest version:** `0.3.3.6` (`apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`)
**Packaging run id:** `2026-04-16T22:42:09.441Z-1dfe9989`

## 1. Governed asset acquisition

**Closed. The hosted runtime now passes a concrete `searchAssets` provider into `ArticlePublisher`.**

Runtime path, end to end:

1. `apps/hb-publisher/src/data/publisherAdapter/assetLibrarySource.ts` implements `createAssetLibrarySearch({ hostSiteUrl, listTitle?, folderServerRelativeUrl?, maxResults? })`. It binds to the HBCentral document library (default `Site Assets`, title-bound until a GUID is registered), composes a `$select` over `Id, UniqueId, Title, FileLeafRef, FileRef, FileDirRef, EncodedAbsUrl, File_x0020_Type`, guards `File_x0020_Type` against `jpg|jpeg|png|gif|webp|svg`, and maps rows via the exported `mapRawAssetRow` into the `AssetLookupEntry` shape the UI consumes (with `suggestedAltText` seeded from `Title`). Failures propagate as labeled throws via `@hbc/sharepoint-platform`'s `fetchListItemsJson`. Blank queries short-circuit with `[]`. Rows that cannot yield a usable URL or identity are filtered out. Commit: `9fd3d7b9` (1.0.0.76).
2. `apps/hb-publisher/src/mount.tsx` exports `buildHostedSearchAssets(spfxContext)` which returns `createAssetLibrarySearch({ hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL })` when `spfxContext` exists, and `undefined` otherwise. `mount()` threads the result through `WebPartRendererContext.searchAssets` into the `ArticlePublisher` renderer. Dev-preview / hostless fallback (`root.render(withThemeProvider(createElement(ArticlePublisher, { siteUrl })))`) is deliberately unchanged — no `searchAssets` is passed, so UI honestly falls back to URL-first entry. Commit: `3f244c3a` (1.0.0.77).
3. Prop-drilling into the image surfaces was already in place before Wave 01 — `ArticlePublisher.tsx` threads `searchAssets` into `HeroPanel`, `SecondaryImagePanel`, and `GalleryPanel`; `GalleryPanel` forwards to `MediaComposer`; all of hero, secondary, gallery/media, and the shared `ImageAssetField` render "Browse library" as the primary action and demote raw URL entry behind `<details>` disclosure when `searchAssets` is defined. The new wiring makes that advertised design real in the hosted path.

Evidence:

- `apps/hb-publisher/src/data/publisherAdapter/assetLibrarySource.test.ts` — 18 Vitest cases cover mapping (null-rejection, URL composition from `FileRef` when `EncodedAbsUrl` is missing, title fallback to `FileLeafRef`, altText trimming, assetId preference), and search behavior (image-type filter, URL-encoding, AbortSignal forwarding, folder scoping, list-title override, labeled error propagation, quote-escape injection guard, dropped-row filtering).
- `apps/hb-publisher/src/mount.test.ts` — locks the two mount contracts: `buildHostedSearchAssets(undefined) === undefined`, and `buildHostedSearchAssets(fakeSpfxContext)` calls `createAssetLibrarySearch` with `hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL`.
- `dist/sppkg/hb-publisher-hosted-load-proof.json` — `contractProbe`, `successPath`, `unmountPath`, and `failurePath` all `pass: true`, proving the packaged bundle exposes `__hbIntel_hbPublisher.mount + .unmount` and that the mount DOM/React tree attach and detach cleanly in `node + jsdom + node:vm`.

## 2. Project identity contract hardening

**Closed. Title-bound `getbytitle('Projects')` is no longer the unstated long-term contract; `field_N` literals no longer scatter through the lookup factory.**

What was removed or centralized:

1. New `apps/hb-publisher/src/data/publisherAdapter/projectsListContract.ts` owns:
   - `PROJECTS_LIST_TITLE = 'Projects'` and optional `PROJECTS_LIST_ID: string | undefined` (undefined today; set when the tenant GUID is registered).
   - `PROJECTS_LIST_FIELDS` field map (mirrors `backend/functions/src/services/projects-list-contract.ts` → `PROJECTS_LIST_FIELD_MAP` for the subset the picker consumes).
   - `PROJECTS_LIST_SELECT_FIELDS` — the uniform `$select` every Projects read uses.
   - `RawProjectsListItem` — the raw SharePoint row shape.
   - `buildProjectsListItemsUrl({ hostSiteUrl, filter, orderBy, top, listId })` — prefers GUID binding via `@hbc/sharepoint-platform`'s `buildListItemsEndpoint` when a GUID is available (module default or per-call override), otherwise falls back to `getbytitle(PROJECTS_LIST_TITLE)`. Returns `{ url, kind: 'guid' | 'title' }`.
   - `projectsListFetchLabel(kind)` — operator-facing label that distinguishes a guid-bound read failure from a title-bound fallback-read failure.

2. `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.ts` no longer hardcodes any `field_N` literal in filter/orderby/select/mapper. All field references go through `PROJECTS_LIST_FIELDS`. `createProjectsLookupSearch` accepts an optional `listId` so a future env/mount-side override can upgrade binding without touching call sites. The fetch `label` now narrates binding kind truthfully.

3. `mapRawProjectRow` now indexes via the constants (`row[PROJECTS_LIST_FIELDS.projectId]` etc.) — the one authoritative mapping point.

Commit: `45ce19ee` (1.0.0.78).

Evidence:

- `apps/hb-publisher/src/data/publisherAdapter/projectsListContract.test.ts` — 9 cases lock: field-map mirror, `$select` uniformity, title-fallback URL shape, GUID-upgrade URL shape, whitespace-only `listId` → title fallback, omission of optional query fragments, raw-filter URL-encoding, host-URL trailing-slash normalization, and binding-kind label narration.
- `apps/hb-publisher/src/data/publisherAdapter/projectsLookupSource.test.ts` — 14 cases including the two new ones that prove the fetch label is `Projects list (title-bound)` by default and `Projects list (guid-bound)` when a GUID override is supplied, and that the URL contains `/_api/web/lists(guid'...')/items` with no `getbytitle` in the GUID path.

**Residual:** no tenant Projects-list GUID is registered yet, so production reads still travel the title-bound code path. This is a tenant-provisioning dependency, not a code gap — when the GUID is supplied (module default or mount-side override), the existing code automatically upgrades with no call-site change.

## 3. Defaults and assistance

**Closed. The safe-default set has expanded materially, every new rule is testable, and author-owned values are never overwritten.**

Before Wave 01: two defaults (`TeamViewerTitle`, `HeroCategoryLabel`) applied save-time; `TeamViewerTitle` also opportunistically filled at project-change via inline `MetadataPanel` logic. `HeroCategoryLabel` was *not* filled at project-change — asymmetric UX.

After Wave 01:

1. New `resolveProjectChangeDefaults({ previousProjectName, nextProjectName, current })` in `metadataDefaults.ts` encodes two explicit rules:
   - **Blank fill** — empty/whitespace field → new project's default.
   - **Stale system-default refresh** — a field still equal to the *previous* project's system default → new project's default. Any value that differs from the previous system default is treated as author-owned and preserved.
2. `MetadataPanel.handleProjectChange` replaces its inline TeamViewer heading code with one call to the helper. `HeroCategoryLabel` now receives opportunistic project-change fill too. Clearing the project also routes through the helper — stale system defaults collapse back to `"The Team"` and `undefined`; author-typed values survive clearing.
3. `intelligentDefaultsForSave` is unchanged — save-time blank-fill still guarantees defaults land even on code paths that never went through the picker.

Commit: `18d529a6` (1.0.0.79).

Evidence author-owned values are preserved:

- `metadataDefaults.test.ts` — 9 added cases explicitly prove: blank + no previous project → fill; author-typed values (`"Meet the people who built it"`, `"Field Story"`) are preserved on project change; author-typed values are preserved when the project is cleared; stale defaults refresh on both change and clear; matching-new-default is a no-op (no `applied` entry); whitespace-only field values are treated as blank.
- `metadataDefaults.test.ts` — the 11 pre-existing cases for `defaultTeamHeading`, `defaultHeroCategoryLabel`, and `intelligentDefaultsForSave` still pass unchanged.

**No speculative editorial content was introduced.** Every new default is project-derived and already narrated by the product's own placeholder/helper copy or by the existing system-default structure — no AI writing.

## 4. First-pass friction reduction

**Closed. The Advanced hero disclosure no longer auto-opens because the system pre-filled a category, and redundant narration is gone.**

Two behavior changes, each small, explicit, and tested:

1. `hasAdvancedHeroOverrides` in `HeroPanel.tsx` now treats `HeroCategoryLabel` as author-owned *only* when its trimmed value differs from `defaultHeroCategoryLabel(draft.ProjectName)`. A draft that carries only the project-derived category keeps the Advanced section closed on first render. Authored categories that diverge from the project name still auto-open it. Without this change, Prompt-04's symmetric fill would have visually forced the disclosure open on every new project-bound article — a regression of the "Advanced = author took control" semantics.

2. Removed the now-redundant `helper="Leave blank to use the project name."` on the `HeroCategoryLabel` field. The field is pre-filled by Prompt-04's project-change helper, so the product demonstrates the behavior directly; the existing `placeholder={draft.ProjectName ?? 'Category displayed on the hero'}` still covers the rare case where the field is blank.

Commit: `12598030` (1.0.0.80).

Shell invariants preserved (verified by the existing test corpus continuing to pass):

- three-region shell layout and rails
- readiness / save-state trust / preview-trust models
- disclosure `testId` contracts (`hero-advanced-section`, `metadata-advanced-section`, etc.)
- accessibility: `floating-ui` dialog semantics for asset browse, focus trap, keyboard nav, escape dismissal, `role="dialog"`/`aria-modal`/`aria-live` regions all untouched
- every surviving helper string carries product truth that isn't narratable by behavior alone (hero-image helper distinguishes governed vs URL-first; MetadataPanel summary-excerpt helper teaches downstream placement; disclosure summaryHints remain)

Evidence:

- `authoringPanels/heroPanel.test.tsx` — 13 cases (5 pre-existing + 8 new). New cases prove: advanced section stays closed when `HeroCategoryLabel === ProjectName`; opens when `HeroCategoryLabel` diverges from `ProjectName`; `hasAdvancedHeroOverrides` is `false` for seeded drafts and drafts with only system-default category; `true` for authored category, `HeroTitle`, `HeroEyebrow`, non-default `HeroThemeVariant`, and `HeroShowMetadata`; `false` for `HeroThemeVariant === 'default'`.
- `authoringPanels/metadataPanel.test.tsx` — 5/5 pre-existing MetadataPanel tests continue to pass, confirming no regression in the project picker read-only fallback, headline input, etc.

## 5. Build, test, packaging, and hosted runtime evidence

Results of the four required validation commands (run at packaging version `1.0.0.80`):

| Command | Outcome |
|---|---|
| `pnpm --filter @hbc/spfx-hb-publisher check-types` | **clean**, no diagnostics. |
| `pnpm --filter @hbc/spfx-hb-publisher test` | **664 / 670 pass**. The 6 failing cases are all in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts`. They were verified against a clean `main` before Prompt-01 (stash + re-run) and failed there too — pre-existing, unrelated to Wave 01 scope. See residuals (§6). |
| `pnpm --filter @hbc/spfx-hb-publisher build` | **success** (`tsc --noEmit && vite build`). `dist/hb-publisher-app.js` = 1,097.27 kB (gzip 342.67 kB); `dist/spfx-hb-publisher.css` = 87.24 kB (gzip 14.16 kB); 4,639 modules transformed. |
| `npx tsx tools/build-spfx-package.ts --domain hb-publisher` | **success**. `hb-publisher.sppkg` = 360.5 kB. All five proof artifacts emitted to `dist/sppkg/`. |

Proof artifacts inspected (packaging run `2026-04-16T22:42:09.441Z-1dfe9989`):

### `dist/sppkg/hb-publisher-shim-proof.json`
Proves the packaged archive carries the single canonical shim `shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-de89ae59.js` mapped to `manifestId: 1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10` → `entryModuleId: 1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10_1.0.0`; `packageShapeAssets.allRequiredAssetsPresent: true`. Source bundle SHA-256 `966bf35ac798549157aac4fb5a1d06f1a9afe9c55629789f27d3babd08ede0d4` matches the hash baked into the packaged filename `hb-publisher-app-966bf35a.js`.

### `dist/sppkg/hb-publisher-package-truth-proof.json`
All five assertions `pass: true`:
- **structuralValidity** — all required package structures present.
- **freshness** — packaged app bundle and shim hashes match the build outputs.
- **sourcePackageSemanticAlignment** — manifest semantic fields verified for `1a6f8b2c…`.
- **liveRuntimeProof** — packaged app bundle contains the `1a6f8b2c…` webpart marker; shim linkage verified.
- **deploymentPostureAlignment** — A1–A7 all pass: version `1.0.0.80` matches source; ProductID matches `solution.id`; feature XML present; `deploymentModel.kind=tenant-scoped-webpart` matches `skipFeatureDeployment=true`; discovery posture aligned (all three: source, packaged, emitted-plan = `false`); toolbox visibility intent `page-picker-discoverable, hiddenFromToolbox=false` matches source; `SkipFeatureDeployment=true` matches source.

Manifest field matches (expected vs actual, all `matches: true`): `id`, `alias`, `componentType`, `supportedHosts`, `preconfiguredEntries` (full nested tree: groupId, group.default, title, description, icon, hiddenFromToolbox, properties), `requiresCustomScript`, `supportsThemeVariants`, `supportsFullBleed: true`, `scriptResourcePath`.

Critical runtime-source fingerprints captured for drift detection:
- `apps/hb-publisher/src/mount.tsx` (sha256 `991abb76…`, mtime `2026-04-16T21:40:27Z`) — includes the Wave 01 `buildHostedSearchAssets` wiring.
- `apps/hb-publisher/src/webparts/articlePublisher/ArticlePublisher.tsx` (sha256 `e2986216…`)
- `apps/hb-publisher/src/data/publisherAdapter/index.ts`, `publisherRepositories.ts`, `publishOrchestrator.ts`
- `ArticlePublisherWebPart.manifest.json` (sha256 `a89134bb…`, version `0.3.3.6`)
- `runtimeContract.ts` (webpart ID source of truth).

### `dist/sppkg/hb-publisher-hosted-deployment-plan.json`
Confirms the hosted deployment story remains unchanged: tenant-scoped install via `Add-PnPApp -Path "./dist/sppkg/hb-publisher.sppkg" -Scope Tenant -Overwrite -Publish`; solution version `1.0.0.80`; runbook `apps/hb-publisher/deployment/README.md`; toolbox visibility `page-picker-discoverable` / `hiddenFromToolbox=false`; tenant-wide enablement model (Phase 19 Prompt-01 + Phase 20 Prompt-01 locks) intact.

### `dist/sppkg/hb-publisher-hosted-load-proof.json`
Runtime loaded from the packaged bundle under `node + jsdom + node:vm`:
- `contractProbe: pass` — `mount` + `unmount` resolve from `globalThis/window`.
- `successPath: pass` — `mount(host, null, { webPartId: "00000000-0000-0000-0000-000000000000" })` attached the documented `role="alert"` unsupported-webpart fallback DOM, proving the React tree rendered through the real code path Wave 01 modified.
- `unmountPath: pass` — React tree detached cleanly.
- `failurePath: pass` — `mount(null, …)` surfaced the documented diagnostic.

Overall `pass: true`.

### `dist/sppkg/hb-publisher.sppkg`
360.5 kB archive; all referenced client-side assets present (`hb-publisher-app-966bf35a.js`, `shell-entry-…-de89ae59.js`, canonical `shell-web-part_237ffd027003f301881e.js`, `spfx-hb-publisher-d3f31daa.css`).

## 6. Residuals

**Pre-existing, unrelated to Wave 01:**

- **6 failures in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts`** (stage-assertion drift in publish/republish/preview orchestration tests: four expect `stage: 'validation'`/`'policy'` but receive `'resolution'`; two expect `result.ok === true` but receive `false`). Verified as pre-existing on clean `main` before Prompt-01 (via `git stash --include-untracked` + re-run: same 6 failures). None of the Wave 01 commits touched the orchestrator, validation, or policy code paths. Tracking fix belongs in an orchestration-focused wave.

- **`pnpm lint` is unusable at the package scope** because no eslint configuration file exists for `apps/hb-publisher`. Pre-existing — none of the Wave 01 commits touched eslint config. Lint enforcement is currently inherited only at the root `pnpm lint` level, which was not run here. Unblocking `pnpm --filter @hbc/spfx-hb-publisher lint` requires adding a package-local `.eslintrc.cjs` / `eslint.config.js` — out of scope for Wave 01.

**Intentionally deferred (out of current Project Spotlight scope, not in-scope gaps):**

- **Projects list GUID registration.** Project lookup is fully GUID-capable (Prompt-03). Actually *using* GUID binding requires the tenant Projects list GUID to be registered (module-level `PROJECTS_LIST_ID` or mount-side `listId` threading). Until that registration happens, the lookup runs the title-bound fallback with an honest `Projects list (title-bound)` fetch label. No code change is required when the GUID becomes available.
- **Asset library GUID registration.** `createAssetLibrarySearch` currently binds by list title (default `Site Assets`). When a curated tenant image library is pinned, the existing `listTitle` / `folderServerRelativeUrl` options absorb the change without call-site churn; no contract reshape needed.
- **Additional project-derived defaults.** Prompt-04 added defaults for the two fields the product already promises via placeholder/helper copy (`TeamViewerTitle`, `HeroCategoryLabel`). Other candidates (`HeroSubhead`, callout text, body closing) either lack a safe project-derived signal or would require ownership-tracking infrastructure the codebase does not yet have — intentionally not brought forward.
- **Advanced editorial / AI-authoring behavior.** Explicitly out of scope per Wave 01's locked posture.
- **Unsupported destinations.** Company Pulse and other destinations remain blocked at adapter/validation/readiness layers; no Wave 01 work expanded destination scope.

## Closure statement

Wave 01 is closed. The supported Project Spotlight runtime is now:

- **more governed** — a concrete asset provider threads through the real mount boundary; the advertised "Browse library" UX is real in hosted use, not just latent in component props;
- **more authoritative** — project lookup is anchored to a centralized, GUID-capable contract that narrates its binding strategy truthfully on failure, with `field_N` literals eliminated from the lookup factory;
- **lower-friction** — project binding now carries HeroCategoryLabel as well as TeamViewerTitle immediately; stale system-defaults clean themselves up on project change; the Advanced hero disclosure trusts the new defaults instead of auto-opening because of them; redundant helper narration was removed where product behavior now carries the meaning.

All six closure sections are supported by committed code changes, targeted tests, and five independently-generated proof artifacts in `dist/sppkg/`.

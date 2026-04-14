# Publisher Extraction, Build & Package Report

Date: 2026-04-14
Result: **success**

## Objective
Extract the Article Publisher SPFx app from the shared `hb-webparts.sppkg` pipeline and establish it as its own standalone `hb-publisher.sppkg`, then compile and package it cleanly.

## Repo-truth files inspected
- `apps/hb-webparts/src/webparts/articlePublisher/ArticlePublisherWebPart.manifest.json`
- `apps/hb-webparts/src/webparts/articlePublisher/runtimeContract.ts`
- `apps/hb-webparts/src/mount.tsx`
- `apps/hb-webparts/config/package-solution.json`
- `apps/hb-webparts/vite.config.ts`, `tsconfig.json`, `vitest.config.ts`, `package.json`
- `tools/build-spfx-package.ts` (full orchestrator)
- `tools/spfx-shell/` layout (shell + release manifests)
- `pnpm-workspace.yaml`, `tsconfig.base.json`

## Current-state findings (pre-extraction)
- Publisher manifest id: `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10` — preserved across the rebrand for deployment lineage; must not change.
- Publisher source colocated with 9 other webparts under `apps/hb-webparts/src/webparts/articlePublisher/` (~75 files after Workstream I).
- Publisher data seam under `apps/hb-webparts/src/homepage/data/publisherAdapter/` — 44 files used exclusively by Publisher.
- Two shared hooks consumed by Publisher AND hbKudos: `useSharePointPeopleSearch.ts`, `useRecipientPhotoHydration.ts` (`useGraphPersonPhotoFn` factory).
- `hb-webparts` solution id: `39b8f2ea-59bd-45b7-b4ec-b590b316833b`; feature id `1f447e99-a2c7-43e5-83d8-d2ed78ed1a96`.
- SPFx orchestrator uses a hardcoded `ALL_DOMAINS` registry in `tools/build-spfx-package.ts` and reads per-app `config/package-solution.json`; each domain produces one `.sppkg` into `dist/sppkg/`.
- `tools/spfx-shell/release/manifests/` is an historical output directory; it is not consumed by the current orchestrator flow (the packager walks `apps/<domain>/src/webparts/`).

## Exact extraction changes made
### New app scaffold `apps/hb-publisher/`
- `package.json` — `@hbc/spfx-hb-publisher` (0.0.1), mirrors hb-webparts scripts + dependencies.
- `tsconfig.json` — extends workspace base, matching `@hbc/ui-kit/*` path aliases.
- `vite.config.ts` — single IIFE entry at `src/mount.tsx`, global name `__hbIntel_hbPublisher`, output `hb-publisher-app.js`.
- `vitest.config.ts` — jsdom, same aliases as hb-webparts.
- `config/package-solution.json` — new solution id `c7b2a144-9d3e-4a71-8e2a-6f9d3c1b7e42`, new feature id `b41e97f8-3c2d-4a59-9e12-d8a7f2b6c901`, `zippedPackage: solution/hb-publisher.sppkg`, version `1.0.0.1`.
- `src/test-setup.ts` — mirrors hb-webparts matchMedia shim.
- `src/mount.tsx` — single-webpart dispatch: `ARTICLE_PUBLISHER_WEBPART_ID → ArticlePublisher`.

### Source moved (git mv, history preserved)
- `apps/hb-webparts/src/webparts/articlePublisher/` → `apps/hb-publisher/src/webparts/articlePublisher/`
- `apps/hb-webparts/src/homepage/data/publisherAdapter/` → `apps/hb-publisher/src/data/publisherAdapter/`

### Source copied (lean, Publisher-only adapter surface)
- `useSharePointPeopleSearch.ts` copied to `apps/hb-publisher/src/data/useSharePointPeopleSearch.ts`; imports rewired from `./spContext.js` to `@hbc/sharepoint-platform` (`getSiteUrl`); kudos-host fallback removed.
- `useRecipientPhotoHydration.ts` copied to `apps/hb-publisher/src/data/useRecipientPhotoHydration.ts`; trimmed to only export `useGraphPersonPhotoFn` (Publisher does not use the recipient-hydration hook).
- `teamViewerContracts.ts` copied to `apps/hb-publisher/src/data/teamViewerContracts.ts` (publisherAdapter's `teamViewerAdapter.ts` and test reference these types).

### Import rewrites across moved files (bulk sed)
- `../../../homepage/data/publisherAdapter` → `../../../data/publisherAdapter`
- `../../homepage/data/publisherAdapter` → `../../data/publisherAdapter`
- `../../homepage/data/useSharePointPeopleSearch` → `../../data/useSharePointPeopleSearch`
- `../hbKudos/hooks/useRecipientPhotoHydration` → `../../data/useRecipientPhotoHydration`
- `../../../webparts/teamViewer/teamViewerContracts` → `../teamViewerContracts`
- Canonical-XML test path adjusted by one directory (`../../../../../../../` → `../../../../../../`) to reflect the new depth under `apps/hb-publisher/`.

### Publisher removed from `hb-webparts.sppkg` pipeline
- `apps/hb-webparts/src/mount.tsx`: dropped `ArticlePublisher` import and the `ARTICLE_PUBLISHER_WEBPART_ID` renderer entry in `WEBPART_RENDERERS` with an in-place comment documenting the package split.
- `apps/hb-webparts/config/package-solution.json`: solution version bumped `1.0.0.302` → `1.0.0.303`.
- The Publisher source and adapter directories were removed from `apps/hb-webparts/src/` via `git mv` to the new app. hb-webparts no longer imports anything Publisher-related.

### Orchestrator
- `tools/build-spfx-package.ts`:
  - Added domain entry `{ dir: 'hb-publisher', camel: 'hbPublisher', pascal: 'HbPublisher', packagingModel: 'single' }` to `ALL_DOMAINS`.
  - Bundle-smoke sandbox gained `document.body.style = {}` and `document.documentElement = { style: {} }` so tiptap/prosemirror-view's module-scope platform detection (`document.documentElement.style`) no longer throws during evaluation. This was only surfaced by hb-publisher because moving StoryBodyEditor shed tiptap out of the hb-webparts bundle.

## Build/config/package files changed
- New: `apps/hb-publisher/package.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `config/package-solution.json`, `src/mount.tsx`, `src/test-setup.ts`, `src/data/{useSharePointPeopleSearch,useRecipientPhotoHydration,teamViewerContracts}.ts`.
- Moved: `apps/hb-publisher/src/webparts/articlePublisher/**` (from hb-webparts); `apps/hb-publisher/src/data/publisherAdapter/**` (from hb-webparts/src/homepage/data).
- Modified: `apps/hb-webparts/src/mount.tsx`, `apps/hb-webparts/config/package-solution.json`, `tools/build-spfx-package.ts`.

## Clean-up steps performed
- `rm -rf dist/sppkg/hb-webparts.sppkg apps/hb-webparts/dist/ apps/hb-publisher/dist/ tools/spfx-shell/assets/*.{js,css} tools/spfx-shell/temp/` before rebuilding both packages.
- Other `dist/sppkg/*.sppkg` files (accounting, admin, project-setup, project-sites, shell-extension) were untouched — they belong to other domains and are not in scope.

## Build commands executed
```
pnpm install --filter @hbc/spfx-hb-publisher --filter @hbc/spfx-hb-webparts
(cd apps/hb-publisher && npx tsc --noEmit)         # clean
(cd apps/hb-publisher && npx vitest run)            # 484 pass / 6 pre-existing failures (publisherEndToEnd, unrelated)
(cd apps/hb-publisher && npx vite build)            # hb-publisher-app.js 1070.72 KB
(cd apps/hb-webparts   && npx tsc --noEmit)         # clean
(cd apps/hb-webparts   && npx vite build)           # hb-webparts-app.js 1011.66 KB
npx tsx tools/build-spfx-package.ts --domain hb-publisher
npx tsx tools/build-spfx-package.ts --domain hb-webparts
```

## Standalone package generation steps
The orchestrator produced `dist/sppkg/hb-publisher.sppkg` via:
1. Discover the single manifest under `apps/hb-publisher/src/webparts/` (Publisher).
2. Hash the Vite bundle → `hb-publisher-app-14918d88.js`.
3. Generate a per-webpart shell shim → `shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-2c9cad34.js`.
4. Run `gulp package-solution` against the rewritten `tools/spfx-shell/config/package-solution.json` with solution id `c7b2a144-…` and feature id `b41e97f8-…`.
5. Copy the final `hb-publisher.sppkg` to `dist/sppkg/`.

## Proof that Publisher was removed from `hb-webparts.sppkg`
```
$ unzip -l dist/sppkg/hb-webparts.sppkg | grep -i "1a6f8b2c\|ArticlePublisher"
(empty — 0 matches)
```
17 other `WebPart_*.xml` entries remain in hb-webparts, all for non-Publisher webparts. Package-truth proof at `dist/sppkg/hb-webparts-package-truth-proof.json`.

## Proof that `hb-publisher.sppkg` now owns the app
```
$ unzip -l dist/sppkg/hb-publisher.sppkg | grep -E "WebPart_|shell-entry-|app-"
   2291 … b41e97f8-3c2d-4a59-9e12-d8a7f2b6c901/WebPart_1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10.xml
1070721 … ClientSideAssets/hb-publisher-app-14918d88.js
  11750 … ClientSideAssets/shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-2c9cad34.js
  47461 … ClientSideAssets/spfx-hb-publisher-5326d9cb.css
```

## Proof of manifest/runtime alignment
- Packaged XML id: `Id="1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10"`
- Runtime contract: `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts` → `ARTICLE_PUBLISHER_WEBPART_ID = '1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10'`
- Mount registration: `apps/hb-publisher/src/mount.tsx` → `[ARTICLE_PUBLISHER_WEBPART_ID]: ({ … }) => createElement(ArticlePublisher, { … })`
- loaderConfig `entryModuleId`: `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10_1.0.0` references `shell-entry-1a6f8b2c-…-2c9cad34.js` which exists in the package.
- `supportsFullBleed: true` preserved (orchestrator validated ✓).

## Proof that the standalone package is fresh
- `stat` mtime of `dist/sppkg/hb-publisher.sppkg`: **Apr 14 19:43:34 2026** (immediately after this extraction run).
- SHA-256: `d38232a3fcfd7f8adb6d5e9eaa714b8eb4466b2b5e17de03330a8df4445684b3`
- Bundle fingerprint embedded in the filename (`hb-publisher-app-14918d88.js`) derives from the just-produced Vite output.
- hb-webparts.sppkg rebuilt at **Apr 14 19:42:36 2026**, SHA-256 `6b3ae061d1fb0b29a5f014ec6dc989c1dc4a5185e792e08626636bf0bd11d05e`.

## Output artifact paths
- `dist/sppkg/hb-publisher.sppkg` (350 KB) — fresh standalone Publisher package.
- `dist/sppkg/hb-webparts.sppkg` (3180 KB) — rebuilt without Publisher.
- `dist/sppkg/hb-webparts-package-truth-proof.json` — orchestrator truth proof (hb-webparts).
- `dist/sppkg/hb-webparts-shim-proof.json` — per-webpart shim proof (hb-webparts).

## Blocking issues encountered and resolved
1. **Bundle-smoke sandbox crash on tiptap's prosemirror-view module** — the IIFE invokes `document.documentElement.style` at module scope. Resolved by extending the orchestrator sandbox (`tools/build-spfx-package.ts`) to expose `document.documentElement: { style: {} }` and `document.body.style: {}`. Sandbox still rejects bundles with genuine SPFx runtime assumption violations; it now just recognises the stylable-element shape prosemirror assumes.
2. **`publisherAdapter/teamViewerAdapter.ts` depended on `teamViewer/teamViewerContracts`** — a type-only cross-reference into a webpart that stays in hb-webparts. Resolved by copying the 98-line contract file into `apps/hb-publisher/src/data/teamViewerContracts.ts`. The hb-webparts teamViewer copy is unchanged.
3. **`xmlShellParser.test.ts` referenced `docs/` via a `../` walk that changed depth after the move** — fixed by dropping one `../` segment.
4. **`useRecipientPhotoHydration.ts` imported the kudos contract** — trimmed the hook file down to only `useGraphPersonPhotoFn` (the Publisher-relevant export).

## Final result: SUCCESS
- Article Publisher extracted from `hb-webparts.sppkg` pipeline ✅
- Fresh standalone `hb-publisher.sppkg` generated ✅
- Standalone package proven to contain the latest local Publisher implementation (moved sources, current runtime contract, fresh bundle hash) ✅
- Manifest and runtime seams aligned ✅
- Publisher absent from rebuilt `hb-webparts.sppkg` ✅
- Stale artifacts cleared before rebuild ✅

## Residual risks / follow-ups for hosted SharePoint vetting
- **First deploy is side-by-side.** Fresh `hb-publisher` solution id means tenants must upload/trust `hb-publisher.sppkg` before the next `hb-webparts.sppkg` upload drops the old Publisher component. Existing page-part instances continue to work through the preserved `1a6f8b2c-…` component id.
- **Duplicated hooks** (`useSharePointPeopleSearch`, `useGraphPersonPhotoFn`) now exist in both apps. If either diverges later a shared subpath of `@hbc/sharepoint-platform` or a new workspace package should absorb them.
- **Test regression list** inherited from pre-extraction state: 6 `publisherEndToEnd.test.ts` failures and the hb-webparts homepage-suite failures are pre-existing (confirmed in Workstream I step-03) and were not introduced by this extraction.
- **Hosted App Catalog smoke test** — upload both sppkg files, enable trust, render a Publisher page-part instance and confirm the bundle loads from the new solution. Out of scope for this task.

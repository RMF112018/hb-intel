# Phase 17 Wave 02 — Closure Proof Artifact

**Status:** Closed
**Closure date:** 2026-04-16
**Final manifest version:** `1.0.0.60`
**Final solution name:** `hb-publisher`
**Final SPFx package:** `dist/sppkg/hb-publisher.sppkg`

This is the proof artifact for Prompt 07. Wave 02 covered seven prompts
(01–07); this document captures the evidence that the upgraded
Publisher still builds, packages, mounts, and behaves correctly in its
SharePoint-hosted SPFx posture.

## 1. Commands run

| # | Command | Purpose |
|---|---|---|
| 1 | `pnpm install` | Resolve workspace deps after Prompt 01 added the premium stack to `apps/hb-publisher`. |
| 2 | `pnpm --filter @hbc/spfx-hb-publisher check-types` | TypeScript validation of the Publisher app source. |
| 3 | `pnpm --filter @hbc/ui-kit build` | Rebuild ui-kit dist so the new `useUnsavedChangesBlocker` re-export from Prompt 05 lands in `dist/homepage.d.ts`. |
| 4 | `npx vitest run --config vitest.config.ts` (in `apps/hb-publisher`) | Full Publisher Vitest suite. |
| 5 | `pnpm --filter @hbc/spfx-hb-publisher build` | App-local build (`tsc --noEmit && vite build`) — produces the IIFE bundle consumed by the SPFx shell. |
| 6 | `npx tsx tools/build-spfx-package.ts --domain hb-publisher` | Repo's actual SPFx packaging path: vite IIFE → spfx-shell adapter → gulp `package-solution --ship` → `dist/sppkg/hb-publisher.sppkg`. |

## 2. Pass/fail results

| Check | Result | Notes |
|---|---|---|
| `check-types` | **PASS** | Clean. |
| Publisher Vitest (full suite, 622 tests) | **PASS (with documented pre-existing failures)** | 616 / 622 pass. The 6 failures are all in `src/data/publisherAdapter/__tests__/publisherEndToEnd.test.ts` and reproduce on clean `main` (verified during Prompt 01 closure by stashing this branch's edits). They are unrelated to Wave 02 scope. |
| Publisher Vitest (UI-scoped subset across the touched seams) | **PASS** | 208 / 208 pass across `sharedChrome`, `storyBodyEditor`, `authoringPanels`, `teamComposer`, `mediaComposer`, `draftQueue`, and `ArticlePublisher.test.tsx`. |
| `vite build` | **PASS** | `dist/hb-publisher-app.js` 1,093.90 kB / gzip 341.49 kB; `dist/spfx-hb-publisher.css` 87.24 kB / gzip 14.16 kB. |
| `gulp package-solution --ship` (via `build-spfx-package.ts`) | **PASS** | "✅ All 1 domain(s) packaged successfully." |
| `supportsFullBleed: true` preservation | **PASS** | "✓ 1a6f8b2c... supportsFullBleed: true preserved" (build-script post-pack inspection). |
| `.sppkg` structure verification | **PASS** | "✓ .sppkg structure verified" (build-script post-pack inspection). |
| Packaged shell asset → IIFE bundle linkage | **PASS** | "✓ Packaged shell asset references hb-publisher-app-8e540b4e.js and `__hbIntel_hbPublisher`." |
| ESLint | **N/A** | `pnpm lint` is a pre-existing no-op in this app (no `.eslintrc` in repo). Documented in the Prompt 01 commit; not a regression. |

## 3. Generated package artifact

```
Path:    /Users/bobbyfetting/hb-intel/dist/sppkg/hb-publisher.sppkg
Size:    368011 bytes (≈ 359 KB)
SHA-256: 63fa523efc30c996fe3b42473d53fde68ba844e9fde537ca80fbe1712576e400
Built:   2026-04-16 04:10 (Prompt 07 proof run at 1.0.0.60).
```

Sibling artifacts in `dist/sppkg/`:

```
hb-intel-accounting.sppkg
hb-intel-admin.sppkg
hb-intel-project-setup.sppkg
hb-intel-project-sites.sppkg
hb-publisher.sppkg              ← this wave's output
hb-shell-extension.sppkg
hb-webparts.sppkg
```

## 4. Runtime identity confirmation

Stable identity GUIDs preserved across Wave 02 (and across this proof bump):

| Identity | Value | Source of truth |
|---|---|---|
| Solution ID | `c7b2a144-9d3e-4a71-8e2a-6f9d3c1b7e42` | `apps/hb-publisher/config/package-solution.json#/solution/id` |
| Feature ID | `b41e97f8-3c2d-4a59-9e12-d8a7f2b6c901` | `apps/hb-publisher/config/package-solution.json#/solution/features/0/id` |
| WebPart ID | `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10` | `apps/hb-publisher/src/webparts/articlePublisher/runtimeContract.ts#ARTICLE_PUBLISHER_WEBPART_ID` |
| Mount global | `__hbIntel_hbPublisher` | `apps/hb-publisher/src/mount.tsx` |

**Three-way match (source ↔ manifest ↔ packaged manifest):**

- `runtimeContract.ts#ARTICLE_PUBLISHER_WEBPART_ID` = `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10`
- `ArticlePublisherWebPart.manifest.json#id` = `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10`
- `mount.tsx WEBPART_RENDERERS` keyed by the same constant
- Packaged `WebPart_1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10.xml` `Id="1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10"` confirms the manifest landed in the .sppkg unchanged

## 5. Manifest confirmation (extracted from packaged .sppkg)

`AppManifest.xml` (extracted from `hb-publisher.sppkg`):

```
<App ... Name="hb-publisher"
        ProductID="c7b2a144-9d3e-4a71-8e2a-6f9d3c1b7e42"
        Version="1.0.0.60" ...>
  <ShortDescription>HB Intel Article Publisher</ShortDescription>
  <LongDescription>HB Intel Article Publisher — authoring surface
    for structured article publishing on HBCentral. Current live
    publishing scope: Project Spotlight articles. Other destinations
    declared in the data model are explicitly blocked at the adapter,
    validation, and readiness layers until they are wired in a later
    release.</LongDescription>
</App>
```

`b41e97f8-.../WebPart_1a6f8b2c-...e8f10.xml` (key fields):

```
ClientSideComponent
  Name="Article Publisher"
  Id="1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10"
  ComponentManifest:
    alias            = "ArticlePublisherWebPart"
    componentType    = "WebPart"
    supportsFullBleed= true
    supportedHosts   = ["SharePointWebPart"]
    preconfiguredEntries[0]:
      groupId        = "5c03119e-3074-46fd-976b-c60198311f70" (HB Intel)
      title          = "Article Publisher"
      description    = "Authoring surface for structured article
                        publishing on HBCentral. Current release scope:
                        Project Spotlight articles — additional
                        destinations are explicitly blocked until they
                        are wired in a later release."
      hiddenFromToolbox = true
    loaderConfig.entryModuleId =
      "1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10_1.0.0"
    loaderConfig.scriptResources["1a6f8b2c-..."].path =
      "shell-entry-1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10-3fd81f9c.js"
```

Confirms:
- Webpart GUID untouched.
- `supportsFullBleed: true` survived packaging (required for hero / full-width hosting).
- `hiddenFromToolbox: true` survived (gating remains controlled by HBCentral page authors).
- Description in the toolbox preconfigured entry agrees with the longDescription rewritten in Prompt 06.

## 6. Local smoke-test / host-validation notes

- Vite preview / SPFx hosted validation in a real tenant is **not** runnable from this environment (no SharePoint tenant credentials available to the agent). The packaging proof above demonstrates the .sppkg is structurally valid and lineage-stable; deployment to HBCentral and click-through smoke-testing is the human follow-up.
- `tools/build-spfx-package.ts` already runs structural inspection on the packaged sppkg (the `.sppkg structure verified` line) and verifies the compiled shell asset references both the IIFE bundle filename and the `__hbIntel_hbPublisher` global, which is the runtime hand-off the SPFx shell uses to invoke `mount`.
- Bundle-size delta over the wave: 1,164.72 kB at 1.0.0.53 (start of Wave 02) → 1,093.90 kB at 1.0.0.59 (after Prompt 05's subpath import scrub). The premium stack added ≈22 kB in Prompts 01–03; Prompt 05 then trimmed ≈96 kB by letting Rollup prune the ui-kit root barrel's transitive surface. Net: **smaller** than where the wave started, with all Wave 02 premium primitives in place.

## 7. What changed across Wave 02 (one-liner per prompt)

| Prompt | Manifest | One-liner |
|---|---|---|
| 01 | `1.0.0.54` | Adopt premium-stack foundation (motion, lucide, floating-ui, radix slot/tooltip/separator/scroll-area) and Publisher-owned primitives (`PublisherIcon`, `PublisherTooltip`, `PublisherSeparator`, `PublisherScrollArea`, `useAnchoredOverlay`); retire inline editor glyphs. |
| 02 | `1.0.0.55` | Rebuild AssetLibraryBrowser modal stack via FloatingPortal + FloatingOverlay + FloatingFocusManager + motion AnimatePresence; portal + motion the ProjectPicker dropdown; convert the editor link prompt from in-flow banner to anchored popover. |
| 03 | `1.0.0.56` | Add `leadingIcon` / `trailingIcon` to PublisherButton; retire `+ New draft` / `+ Add teammate` / `+ Add image` text-symbol CTAs; replace 8 CSS pseudo-chevrons with rendered lucide ChevronRight (DisclosureSection, ImageAssetField ×2, ExceptionalNotice, StoryBodyEditor shortcuts, MediaComposer advanced URL, ProjectPicker chip, ArticlePublisher canvas-lane). |
| 04 | `1.0.0.57` | Extract ProjectPicker (~200 lines) and DisclosureSection CSS to colocated modules; harden `tokens.module.css` provenance contract. |
| 05 | `1.0.0.58` | Subpath-only ui-kit imports in `apps/hb-publisher` (zero root-barrel imports remain); add `useUnsavedChangesBlocker` re-export to `@hbc/ui-kit/homepage`. |
| 06 | `1.0.0.59` | Rewrite `package-solution.json` `longDescription` to drop the `(Project Spotlight and future destinations)` overstatement and the stale `Previously bundled inside hb-webparts.sppkg` lineage; rename feature title from `hb-publisher Feature` to `Article Publisher`. |
| 07 | `1.0.0.60` | Final closure proof — this artifact. |

## 8. Out-of-scope / remaining assumptions

- The 6 pre-existing `publisherEndToEnd.test.ts` failures remain. They reproduce on clean `main` and are unrelated to Wave 02 scope. Following waves should triage them on their own.
- Hosted (HBCentral tenant) click-through validation of the packaged `.sppkg` is not runnable from this environment; treated as the human deployment follow-up.
- ESLint is a no-op in `apps/hb-publisher` because the app has no `.eslintrc`. This is a pre-existing repo state, not introduced by this wave.

## 9. Conclusion

The Publisher still builds, typechecks, runs its UI test suite, produces a structurally valid `.sppkg`, and preserves every stable identity (solution, feature, webpart) across Wave 02. The premium stack is materially used (not symbolic), the overlay seams are governed by floating-ui, the action language is one coherent family, the shell CSS owns only shell rules, the ui-kit import graph is subpath-clean, and the package descriptor agrees with the live runtime scope. **Wave 02 is closed.**
